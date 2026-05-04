import { IconBrandInstagram } from "@tabler/icons-react";
import { format } from "date-fns";
import { ArchiveIcon, HeartIcon, MessageSquareIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useFetcher,
  useFetchers,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import { toast } from "sonner";
import { ActionFormFooter } from "~/components/features/ActionForm/ActionFormFooter";
import { EssentialsTab } from "~/components/features/ActionForm/EssentialsTab";
import { InstagramTab } from "~/components/features/ActionForm/InstagramTab";
import { ObservationsTab } from "~/components/features/ActionForm/ObservationsTab";
import { INTENT } from "~/lib/CONSTANTS";
import { handleAction, isInstagramFeed } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import type { Partner } from "~/models/partners.server";
import type { AppLoaderData } from "~/routes/app";

function getCaptionTail(instagram_caption_tail: string | null) {
  return "".concat("\n\n").concat(instagram_caption_tail || "");
}

export function CreateAndEditAction({
  BaseAction,
  onClose,
}: {
  BaseAction: Action;
  onClose: () => void;
}) {
  const [view, setView] = useState<"essential" | "instagram" | "observations">(
    "essential",
  );
  const { partners, cloudName, uploadPreset } = useRouteLoaderData(
    "routes/app",
  ) as AppLoaderData & { partners: Partner[] };

  const fetcher = useFetcher();
  const submit = useSubmit();
  const fetchers = useFetchers();

  const [RawAction, setRawAction] = useState<Action>(BaseAction);

  // Ref always points to the latest RawAction to avoid stale closures
  const rawActionRef = useRef(RawAction);
  useEffect(() => {
    rawActionRef.current = RawAction;
  }, [RawAction]);

  // Ref for the latest description typed in Tiptap — updated on every keystroke
  // without triggering re-renders. handleSave reads from here so Cmd+Enter
  // always saves the latest typed content even without blur.
  const descriptionRef = useRef(BaseAction.description || "");

  const handleSave = useCallback(async () => {
    if (!RawAction.title) {
      toast.error("Erro / O título é obrigatório", {
        position: "top-center",
      });
      return;
    }

    if (RawAction.partners.length === 0) {
      toast.error("Erro / Pelo menos um parceiro deve ser selecionado", {
        position: "top-center",
      });
      return;
    }

    await handleAction(
      {
        ...RawAction,
        description: descriptionRef.current, // always latest typed content
        intent: RawAction.id ? INTENT.update_action : INTENT.create_action,
      },
      submit,
    );
  }, [RawAction, submit]);

  // Ref always points to the latest handleSave to avoid stale closures in event listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    if (RawAction.id && !BaseAction.id) {
      handleAction({ ...RawAction, intent: INTENT.update_action }, submit);
    }
    descriptionRef.current = BaseAction.description || "";
    setRawAction(BaseAction);
  }, [BaseAction]);

  const [isPending, setIsPending] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [descriptionVersion, setDescriptionVersion] = useState(0);

  useEffect(() => {
    setIsPending(
      fetchers.filter((f) => (f as any).json || f.state === "submitting")
        .length > 0,
    );

    setIsAIProcessing(
      fetchers.filter(
        (f) =>
          f.formData?.get("intent") === INTENT.ai_caption ||
          f.formData?.get("intent") === INTENT.ai_hooks ||
          f.formData?.get("intent") === INTENT.ai_post ||
          f.formData?.get("intent") === INTENT.ai_carousel ||
          f.formData?.get("intent") === INTENT.ai_stories ||
          f.formData?.get("intent") === INTENT.ai_reels,
      ).length > 0,
    );

    fetchers.forEach((f) => {
      const payload = (f as any).json;
      if (payload && f.data) {
        const intent = payload.intent;

        if (intent === INTENT.create_action) {
          const newId = f.data?.id;
          if (newId) {
            setRawAction((prev) => {
              if (prev.id === newId) return prev;
              return { ...prev, id: newId };
            });
          }
        }
      }
    });
  }, [fetchers]);

  if (!RawAction.created_at) {
    setRawAction({
      ...RawAction,
      created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  }

  const [currentPartners, setCurrentPartners] = useState<Partner[]>([]);

  const [workFiles, setWorkFiles] = useState<string[]>(
    RawAction.work_files ?? [],
  );
  const [contentFiles, setContentFiles] = useState<string[]>(
    RawAction.content_files ?? [],
  );

  function updateContentFiles(next: string[]) {
    setContentFiles(next);
    setRawAction((prev) => ({ ...prev, content_files: next }));
    updateAction({ content_files: next });
  }

  const updateAction = useCallback(
    async (data?: { [key: string]: any }, forceCreate = false) => {
      const current = rawActionRef.current;

      if (
        current.id ||
        (forceCreate &&
          !current.id &&
          current.title &&
          current.partners.length > 0)
      ) {
        await handleAction(
          {
            ...current,
            ...data,
            intent: current.id ? INTENT.update_action : INTENT.create_action,
          },
          submit,
        );
      }
    },
    [submit],
  );

  // Use a stable string key so this effect only re-runs when partner slugs
  // actually change, not on every setRawAction call (which would create a new
  // array reference each time and cause an infinite cascade).
  const partnersKey = RawAction.partners.join(",");
  useEffect(() => {
    if (!partnersKey) return;
    setCurrentPartners(
      RawAction.partners.map((p) =>
        partners.find((partner) => partner.slug === p),
      ) as Partner[],
    );
  }, [partnersKey]);

  // Guard: only update color if it actually changed to avoid
  // triggering another render cycle via the partners effect above.
  useEffect(() => {
    if (!BaseAction.id && currentPartners.length > 0) {
      const newColor = currentPartners[0].colors[0];

      const newResponsibles = currentPartners
        .map((p) => p.users_ids.map((user) => user))
        .flat();

      setRawAction((prev) =>
        prev.color === newColor
          ? prev
          : { ...prev, color: newColor, responsibles: newResponsibles },
      );
    }
  }, [currentPartners]);

  useEffect(() => {
    if (fetcher.data) {
      const intent = fetcher.data.intent;

      if (intent === INTENT.ai_caption) {
        const captionText =
          typeof fetcher.data.output === "string"
            ? fetcher.data.output
            : fetcher.data.output.caption;

        const newCaption = (captionText || "").concat(
          getCaptionTail(currentPartners[0]?.instagram_caption_tail),
        );
        setRawAction((prev) => ({
          ...prev,
          instagram_caption: newCaption,
        }));
        updateAction({ instagram_caption: newCaption });
      }

      if (
        [
          INTENT.ai_post,
          INTENT.ai_carousel,
          INTENT.ai_stories,
          INTENT.ai_reels,
        ].includes(intent)
      ) {
        const { content, caption } = fetcher.data.output;
        const newCaption = (caption || "").concat(
          getCaptionTail(currentPartners[0]?.instagram_caption_tail),
        );

        const currentDescription = rawActionRef.current.description || "";
        const newDescription = content + "<hr />" + currentDescription;

        setRawAction((prev) => ({
          ...prev,
          description: newDescription,
          instagram_caption: newCaption,
        }));

        // Atualiza a ref da descrição para o Tiptap não sobrescrever
        descriptionRef.current = newDescription;

        // Incrementa a versão para forçar o Tiptap a remontar com o novo conteúdo
        setDescriptionVersion((v) => v + 1);

        updateAction({
          description: newDescription,
          instagram_caption: newCaption,
        });
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLocaleLowerCase() === "escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key.toLocaleLowerCase() === "enter" && event.metaKey) {
        event.preventDefault();
        event.stopPropagation();
        handleSaveRef.current();
        if (!event.shiftKey) {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const tabClass = (active: boolean) =>
    cn(
      "flex w-full cursor-pointer items-center justify-center gap-2 border-b p-4 text-sm font-medium",
      active ? "bg-background border-b-transparent" : "bg-muted border-border",
    );

  return (
    <div
      className={cn(
        "bg-background fixed top-17 right-0 bottom-0 z-10 flex w-full shrink-0 flex-col overflow-hidden border-l",

        view === "instagram" ? "lg:w-4xl" : "lg:w-2xl",
      )}
    >
      {RawAction.archived && (
        <div className="flex shrink-0 items-center justify-center gap-2 bg-amber-500 p-2 text-sm font-medium text-amber-50 dark:text-amber-950">
          <ArchiveIcon className="size-4" />
          Esta ação está arquivada.
          <button
            onClick={() => {
              setRawAction((prev) => ({ ...prev, archived: false }));
              updateAction({ archived: false });
            }}
            className="ml-2 underline hover:no-underline"
          >
            Desarquivar
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex shrink-0 divide-x">
        <div
          className={tabClass(view === "essential")}
          onClick={() => setView("essential")}
        >
          ESSENCIAL <HeartIcon className="size-4" />
        </div>
        {isInstagramFeed(RawAction.category) && (
          <div
            className={tabClass(view === "instagram")}
            onClick={() => setView("instagram")}
          >
            INSTAGRAM <IconBrandInstagram className="size-4" />
          </div>
        )}
        <div
          className={tabClass(view === "observations")}
          onClick={() => setView("observations")}
        >
          OBSERVAÇÕES <MessageSquareIcon className="size-4" />
        </div>
        <div>
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 border-b p-5 text-sm font-medium"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative flex h-full grow flex-col overflow-hidden">
        {/* Essencial */}

        {view === "essential" && (
          <EssentialsTab
            isAIProcessing={isAIProcessing}
            fetcher={fetcher}
            RawAction={RawAction}
            setRawAction={setRawAction}
            updateAction={updateAction}
            workFiles={workFiles}
            setWorkFiles={setWorkFiles}
            currentPartners={currentPartners}
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            onDescriptionChange={(desc: string) => {
              descriptionRef.current = desc;
            }}
            descriptionVersion={descriptionVersion}
          />
        )}
        {view === "instagram" && (
          <InstagramTab
            RawAction={RawAction}
            setRawAction={setRawAction}
            contentFiles={contentFiles}
            updateContentFiles={updateContentFiles}
            currentPartners={currentPartners}
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            isAIProcessing={isAIProcessing}
            fetcher={fetcher}
          />
        )}
        {view === "observations" && (
          <ObservationsTab
            actionId={RawAction.id}
            actionColor={currentPartners[0]?.colors?.[0] || RawAction.color}
            actionTextColor={currentPartners[0]?.colors?.[1]}
          />
        )}
        {/* Criar e Atualizar */}
        <ActionFormFooter
          RawAction={RawAction}
          setRawAction={setRawAction}
          updateAction={updateAction}
          currentPartners={currentPartners}
          isPending={isPending}
          handleSave={handleSave}
          handleClose={onClose}
        />
      </div>
    </div>
  );
}
