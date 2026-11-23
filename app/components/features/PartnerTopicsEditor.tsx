import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { FormSection } from "~/components/layout/FormSection";
import {
  PrismButton,
  PrismDialog,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismInput,
} from "~/components/prism";
import { UColorPickerDropdown } from "~/components/uzzina/UColorPickerDropdown";
import { ULoader } from "~/components/uzzina/ULoader";
import { useAppContext } from "~/contexts/AppContext";
import { usePartnerTopics } from "~/hooks/usePartnerTopics";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  MAX_TOPICS_PER_PARTNER,
  MAX_TOPIC_TITLE_LENGTH,
  countActionsByTopic,
  createPartnerTopic,
  deletePartnerTopic,
  updatePartnerTopic,
} from "~/models/partners";
import type { PartnerTopic } from "~/types";
import { safeColor } from "~/utils/uzzina-utils";

const COLOR_SAVE_DELAY_MS = 500;

function describeError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    if (error.code === "23505")
      return "Já existe um tópico com este nome neste parceiro.";
    if (error.code === "23514")
      return "Tópico inválido (nome de 1 a 40 caracteres, no máximo 12 por parceiro).";
  }
  return error instanceof Error ? error.message : "Erro desconhecido.";
}

/** Admin → Parceiro: topics (name + color) of one partner. Saves each change on its own. */
export function PartnerTopicsEditor({
  partnerId,
  brandColors,
}: {
  partnerId: string;
  brandColors: string[];
}) {
  const { person } = useAppContext();
  const queryClient = useQueryClient();
  const { topics: allTopics } = usePartnerTopics();
  const topics = allTopics.filter((topic) => topic.partner_id === partnerId);
  const queryKey = QUERY_KEYS.partnerTopics(person.user_id);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    topic: PartnerTopic;
    actionCount: number;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const writeCache = (change: (current: PartnerTopic[]) => PartnerTopic[]) =>
    queryClient.setQueryData<PartnerTopic[]>(queryKey, (current) =>
      change(current ?? []),
    );

  const createTopic = async () => {
    if (isCreating || topics.length >= MAX_TOPICS_PER_PARTNER) return;
    setIsCreating(true);
    try {
      const used = new Set(topics.map((topic) => topic.title.toLowerCase()));
      let title = "Novo tópico";
      for (let index = 2; used.has(title.toLowerCase()); index++)
        title = `Novo tópico ${index}`;
      const created = await createPartnerTopic(createSupabaseBrowserClient(), {
        partner_id: partnerId,
        title,
        color: safeColor(brandColors[0]).toLowerCase(),
        position: Math.max(-1, ...topics.map((topic) => topic.position)) + 1,
      });
      writeCache((current) => [...current, created]);
    } catch (error) {
      toast.error(`Não foi possível criar o tópico. ${describeError(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const requestDelete = async (topic: PartnerTopic) => {
    try {
      const actionCount = await countActionsByTopic(
        createSupabaseBrowserClient(),
        topic.id,
      );
      setPendingDelete({ topic, actionCount });
    } catch (error) {
      toast.error(
        `Não foi possível contar as ações do tópico. ${describeError(error)}`,
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deletePartnerTopic(
        createSupabaseBrowserClient(),
        pendingDelete.topic.id,
      );
      writeCache((current) =>
        current.filter((topic) => topic.id !== pendingDelete.topic.id),
      );
      // Actions of the topic now show their own color again.
      void queryClient.invalidateQueries({ queryKey: ["actions"] });
      setPendingDelete(null);
    } catch (error) {
      toast.error(`Não foi possível excluir o tópico. ${describeError(error)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const atLimit = topics.length >= MAX_TOPICS_PER_PARTNER;
  return (
    <FormSection
      title="Tópicos"
      description={`Organize as ações da marca com até ${MAX_TOPICS_PER_PARTNER} tópicos. Cada ação categorizada usa a cor do tópico.`}
      trailing={isCreating ? <ULoader /> : undefined}
    >
      {topics.length === 0 ? (
        <p className="text-sm text-secondary-foreground">
          Este parceiro ainda não tem tópicos.
        </p>
      ) : (
        <ul className="grid gap-2">
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              brandColors={brandColors}
              onDelete={() => requestDelete(topic)}
              onSaved={(saved) =>
                writeCache((current) =>
                  current.map((item) => (item.id === saved.id ? saved : item)),
                )
              }
              topic={topic}
            />
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <PrismButton
          isDisabled={isCreating || atLimit}
          onClick={createTopic}
          size="sm"
          type="button"
          variant="secondary"
        >
          Novo tópico <PlusIcon />
        </PrismButton>
        {atLimit && (
          <span className="text-xs text-secondary-foreground">
            Limite de {MAX_TOPICS_PER_PARTNER} tópicos atingido.
          </span>
        )}
      </div>

      <PrismDialog
        isDismissable
        isOpen={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDelete(null);
        }}
        size="sm"
      >
        <PrismDialogHeader>
          <PrismDialogTitle>Excluir tópico</PrismDialogTitle>
        </PrismDialogHeader>
        <div className="px-5 py-4 text-sm text-secondary-foreground">
          {pendingDelete && (
            <>
              {pendingDelete.actionCount === 0
                ? "Nenhuma ação usa o tópico "
                : pendingDelete.actionCount === 1
                  ? "1 ação usa o tópico "
                  : `${pendingDelete.actionCount} ações usam o tópico `}
              <strong className="text-foreground">
                {pendingDelete.topic.title}
              </strong>
              .
              {pendingDelete.actionCount > 0 &&
                " Elas ficarão sem tópico e voltarão a mostrar a própria cor."}
            </>
          )}
        </div>
        <PrismDialogFooter>
          <PrismButton
            onClick={() => setPendingDelete(null)}
            size="sm"
            variant="ghost"
          >
            Cancelar
          </PrismButton>
          <PrismButton
            isDisabled={isDeleting}
            onClick={confirmDelete}
            size="sm"
            variant="error"
          >
            Excluir tópico
          </PrismButton>
        </PrismDialogFooter>
      </PrismDialog>
    </FormSection>
  );
}

function TopicRow({
  topic,
  brandColors,
  onSaved,
  onDelete,
}: {
  topic: PartnerTopic;
  brandColors: string[];
  onSaved: (topic: PartnerTopic) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(topic.title);
  const [color, setColor] = useState(topic.color);
  const [isSaving, setIsSaving] = useState(false);
  const colorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingColor = useRef<string | null>(null);
  const latest = useRef({ topic, onSaved });
  latest.current = { topic, onSaved };

  // Keep the fields in sync when the cache changes from elsewhere.
  useEffect(() => setTitle(topic.title), [topic.title]);
  useEffect(() => setColor(topic.color), [topic.color]);

  const save = async (changes: { title?: string; color?: string }) => {
    setIsSaving(true);
    try {
      const saved = await updatePartnerTopic(
        createSupabaseBrowserClient(),
        latest.current.topic.id,
        changes,
      );
      latest.current.onSaved(saved);
    } catch (error) {
      toast.error(`Não foi possível salvar o tópico. ${describeError(error)}`);
      setTitle(latest.current.topic.title);
      setColor(latest.current.topic.color);
    } finally {
      setIsSaving(false);
    }
  };

  const flushColor = () => {
    if (colorTimer.current) clearTimeout(colorTimer.current);
    colorTimer.current = null;
    const next = pendingColor.current;
    pendingColor.current = null;
    if (next && next !== latest.current.topic.color) void save({ color: next });
  };
  // Save a color still waiting for its delay when the row goes away.
  const flushRef = useRef(flushColor);
  flushRef.current = flushColor;
  useEffect(() => () => flushRef.current(), []);

  return (
    <li className="flex items-center gap-2">
      <UColorPickerDropdown
        aria-label={`Cor do tópico ${topic.title}`}
        groups={[{ id: "brand", colors: brandColors }]}
        onChange={(picked) => {
          const next = safeColor(picked).toLowerCase();
          setColor(next);
          pendingColor.current = next;
          if (colorTimer.current) clearTimeout(colorTimer.current);
          colorTimer.current = setTimeout(flushColor, COLOR_SAVE_DELAY_MS);
        }}
        size="icon"
        value={color}
        variant="secondary"
      />
      <div className="relative min-w-0 flex-1">
        <PrismInput
          aria-label="Nome do tópico"
          className="w-full pr-9"
          maxLength={MAX_TOPIC_TITLE_LENGTH}
          onBlur={() => {
            const next = title.trim();
            if (!next) {
              setTitle(topic.title);
              return;
            }
            if (next !== topic.title) void save({ title: next });
            else setTitle(next);
          }}
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />
        {isSaving && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ULoader />
          </span>
        )}
      </div>
      <PrismButton
        aria-label={`Excluir tópico ${topic.title}`}
        onClick={onDelete}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Trash2Icon />
      </PrismButton>
    </li>
  );
}
