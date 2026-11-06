import { AppBarSpacer } from "~/components/layout/AppBarSpacer";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArchiveIcon,
  BadgeCheckIcon,
  MailCheckIcon,
  MegaphoneIcon,
  PrinterIcon,
  UploadIcon,
} from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UPaletteEditor } from "~/components/uzzina/UPaletteEditor";

const Tiptap = lazy(() =>
  import("~/components/features/RichTextEditor").then((module) => ({
    default: module.Tiptap,
  })),
);
import {
  PrismButton,
  PrismInput,
  PrismLabel,
  PrismSkeleton,
  PrismTextarea,
  PrismToggle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { QUERY_KEYS } from "~/lib/query-keys";
import { getAllCelebrations } from "~/models/celebrations";
import { UPartnerCelebrationsSelector } from "~/components/uzzina/UPartnerCelebrationsSelector";
import { CloudinaryUpload } from "~/components/features/media/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";
import { ULoader } from "~/components/uzzina/ULoader";
import { useAppContext } from "~/contexts/AppContext";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { fetchPeople } from "~/lib/supabase.queries";
import {
  createPartner,
  getPartnerBySlug,
  getPartnerHolidayIds,
  partnerSlugExists,
  updatePartnerBySlug,
  updatePartnerHolidays,
} from "~/models/partners";
import type { Partner } from "~/types";
import { CloudIcon } from "lucide-react";
import { AdminGuard } from "~/components/features/AdminGuard";
export const Route = createFileRoute("/app/admin/partner/$slug")({
  component: AdminPartnerEditPageWrapper,
});

function AdminPartnerEditPageWrapper() {
  return (
    <AdminGuard>
      <AdminPartnerEditPage />
    </AdminGuard>
  );
}
function AdminPartnerEditPage() {
  const appData = useAppContext();
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const generation = useRef(getQuerySessionGeneration(queryClient)).current;
  const isCurrentSession = () =>
    generation === getQuerySessionGeneration(queryClient);

  const isNew = slug === "new" || !slug;

  // Queries client-side
  const { data: people = [] } = useQuery({
    queryKey: ["people", "team", appData.person.user_id, "visible"],
    queryFn: fetchPeople,
  });
  const { data: partner, isLoading: isLoadingPartner } = useQuery({
    queryKey: ["partner", "team", appData.person.user_id, slug],
    queryFn: async () => {
      if (isNew) return null;
      return getPartnerBySlug(supabase, slug || "");
    },
    enabled: !isNew,
  });
  const [contextValue, setContextValue] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [voiceValue, setVoiceValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [brandColors, setBrandColors] = useState<string[]>([]);

  const [sowValue, setSowValue] = useState<
    "marketing" | "socialmedia" | "demand"
  >("marketing");
  const [isArchived, setIsArchived] = useState(false);
  const [_justSaved, setJustSaved] = useState(false);
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Todas as datas comemorativas e feriados vinculados ao parceiro
  const { data: celebrations = [], isLoading: isLoadingCelebrations } =
    useQuery({
      queryKey: ["celebrations", "all"],
      queryFn: () => getAllCelebrations(supabase),
    });

  const { data: partnerHolidayIds } = useQuery({
    queryKey: QUERY_KEYS.partnerHolidays(partner?.id || ""),
    queryFn: () =>
      partner?.id ? getPartnerHolidayIds(supabase, partner.id) : [],
    enabled: !isNew && !!partner?.id,
  });

  const [selectedHolidays, setSelectedHolidays] = useState<string[]>([]);

  useEffect(() => {
    if (partnerHolidayIds) {
      setSelectedHolidays(partnerHolidayIds);
    }
  }, [partnerHolidayIds]);

  const handleToggleHoliday = async (holidayId: string, isChecked: boolean) => {
    const next = isChecked
      ? [...selectedHolidays, holidayId]
      : selectedHolidays.filter((id) => id !== holidayId);
    setSelectedHolidays(next);

    if (!isNew && partner?.id) {
      setSavingFields((prev) => new Set(prev).add("holidays"));
      try {
        await updatePartnerHolidays(supabase, partner.id, next);
        queryClient.setQueryData(QUERY_KEYS.partnerHolidays(partner.id), next);
      } catch {
        toast.error("Erro ao salvar datas da marca.");
      } finally {
        setSavingFields((prev) => {
          const s = new Set(prev);
          s.delete("holidays");
          return s;
        });
      }
    }
  };

  const handleClearHolidays = async () => {
    setSelectedHolidays([]);
    if (!isNew && partner?.id) {
      setSavingFields((prev) => new Set(prev).add("holidays"));
      try {
        await updatePartnerHolidays(supabase, partner.id, []);
        queryClient.setQueryData(QUERY_KEYS.partnerHolidays(partner.id), []);
      } catch {
        toast.error("Erro ao limpar datas da marca.");
      } finally {
        setSavingFields((prev) => {
          const s = new Set(prev);
          s.delete("holidays");
          return s;
        });
      }
    }
  };

  // Armazena valores atuais de formulário para referência rápida e mutações parciais
  const stateRef = useRef({
    title: "",
    short: "",
    slug: "",
    instagram_caption_tail: "",
    sow: "marketing" as "marketing" | "socialmedia" | "demand",
    archived: false,
  });
  const sow_list = [
    {
      id: "marketing",
      title: "Marketing",
      icon: <MegaphoneIcon className="size-8" />,
    },
    {
      id: "socialmedia",
      title: "Social Media",
      icon: <BadgeCheckIcon className="size-8" />,
    },
    {
      id: "demand",
      title: "Demanda",
      icon: <MailCheckIcon className="size-8" />,
    },
  ] as const;

  // Inicializa estados quando o parceiro for carregado
  useEffect(() => {
    if (partner) {
      setContextValue(partner.context || "");
      setImageUrl(partner.image || null);
      setVoiceValue(partner.voice || "");
      setSelectedUsers(partner.users_ids || []);
      setBrandColors(partner.colors || []);

      const initialSow = partner.sow || "marketing";
      setSowValue(initialSow);
      const initialArchived = partner.archived || false;
      setIsArchived(initialArchived);
      stateRef.current = {
        title: partner.title || "",
        short: partner.short || "",
        slug: partner.slug || "",
        instagram_caption_tail: partner.instagram_caption_tail || "",
        sow: initialSow,
        archived: initialArchived,
      };
    }
  }, [partner]);

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: async (partnerData: Omit<Partner, "id" | "created_at">) => {
      if (partnerData.users_ids.length === 0) {
        throw new Error("Selecione pelo menos um responsável para o parceiro.");
      }
      if (isNew) {
        const slugTaken = await partnerSlugExists(supabase, partnerData.slug);
        if (!isCurrentSession())
          throw new Error("A sessão mudou. Entre novamente.");
        if (slugTaken) {
          throw new Error("Este slug já está em uso.");
        }
        const created = await createPartner(supabase, partnerData);
        if (created?.id && selectedHolidays.length > 0) {
          await updatePartnerHolidays(supabase, created.id, selectedHolidays);
        }
      } else {
        await updatePartnerBySlug(supabase, slug || "", partnerData);
      }
    },
    onSuccess: () => {
      if (!isCurrentSession()) return;
      queryClient.invalidateQueries({
        queryKey: ["partner", "team", appData.person.user_id, slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["partners"],
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      if (isNew) {
        toast.success("Parceiro criado com sucesso!");
        navigate({
          to: "/app/admin/partners",
        });
      }
    },
    onError: (err: unknown) => {
      if (!isCurrentSession()) return;
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao salvar: ${message}`);
    },
  });
  const isSubmitting = saveMutation.isPending;

  // Função auxiliar para disparar salvamento automático de campos individuais (apenas na edição)
  const triggerAutoSave = async (
    patch: Partial<Omit<Partner, "id" | "created_at">>,
  ) => {
    if (isNew) return; // Não salvar automaticamente na tela de novo parceiro

    const currentData = {
      title: stateRef.current.title,
      slug: stateRef.current.slug,
      colors: brandColors.length > 0 ? brandColors : ["#000000", "#ffffff"],
      archived: stateRef.current.archived,
      users_ids: selectedUsers,
      short: stateRef.current.short,
      context: contextValue || null,
      voice: voiceValue || null,
      image: imageUrl || null,
      instagram_caption_tail: stateRef.current.instagram_caption_tail || null,
      sow: stateRef.current.sow,

      ...patch,
    };

    // Validar antes de enviar
    if (currentData.users_ids.length === 0) {
      toast.error("O parceiro precisa ter ao menos um responsável.");
      return;
    }
    const keys = Object.keys(patch);
    setSavingFields((prev) => {
      const next = new Set(prev);
      for (const key of keys) next.add(key);
      return next;
    });
    try {
      await saveMutation.mutateAsync(currentData);
    } catch {
      // O erro já é tratado no onError da mutation
    } finally {
      setSavingFields((prev) => {
        const next = new Set(prev);
        for (const key of keys) next.delete(key);
        return next;
      });
    }
  };
  const handleBlurField = <K extends keyof typeof stateRef.current>(
    fieldName: K,
    value: (typeof stateRef.current)[K],
  ) => {
    const currentValue = stateRef.current[fieldName];
    if (currentValue !== value) {
      stateRef.current[fieldName] = value;
      triggerAutoSave({
        [fieldName]: value,
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = Object.fromEntries(formData);
    const colors =
      brandColors.length > 0 ? brandColors : ["#000000", "#ffffff"];
    const partnerData = {
      title: updates.title as string,
      slug: (isNew ? updates.slug : slug) as string,
      colors,
      archived: updates.archived === "on",
      users_ids: selectedUsers,
      short: (updates.short as string) || "",
      context: contextValue || null,
      voice: voiceValue || null,
      image: imageUrl || null,
      instagram_caption_tail:
        (updates.instagram_caption_tail as string) || null,
      sow: stateRef.current.sow,
    };
    await saveMutation.mutateAsync(partnerData);
  };
  if (isLoadingPartner) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-4 bg-background">
        <ULoader size="2xl" className="text-primary" />
        <p className="animate-pulse text-sm font-medium text-muted-foreground">
          Carregando parceiro...
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-8">
      <div className="flex justify-between gap-8">
        <h1 className="mb-8 text-2xl font-bold">
          {partner ? `Editar ${partner.title}` : "Novo Parceiro"}
        </h1>

        <div className="flex gap-2">
          <Link
            className="font-medium hover:underline"
            to="/app/admin/partners"
          >
            Parceiros
          </Link>
          {!isNew && (
            <a
              className="hover:underline"
              href={`/print/partner/${partner?.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              <PrinterIcon className="size-5" />
            </a>
          )}
        </div>
      </div>
      <form
        key={partner?.slug ?? "new"}
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
      >
        <input name="image" type="hidden" value={imageUrl || ""} />

        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <CloudinaryUpload
            aria-label="Alterar imagem do parceiro"
            variant="ghost"
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition no-squircle hover:opacity-90"
            cloudName={appData.cloudName}
            folder="uzzina/partners"
            onUpload={(url: string) => {
              setImageUrl(url);
              triggerAutoSave({
                image: url,
              });
            }}
            outputWidth={400}
            square
            uploadPreset={appData.uploadPreset}
          >
            <UAvatar
              key={imageUrl ?? "empty"}
              fallback={partner?.short || "?"}
              image={imageUrl}
              size="2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition group-hover:opacity-100">
              <UploadIcon className="size-6 text-background" />
            </div>
          </CloudinaryUpload>

          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-2 font-medium">
              <span>Logotipo da Marca</span>
              {savingFields.has("image") && <ULoader />}
            </div>
            <div className="text-sm text-muted-foreground">
              Clique para fazer upload e recortar
            </div>
            {imageUrl && (
              <PrismButton
                className="mt-1 h-auto p-0 text-left text-xs text-muted-foreground hover:text-foreground"
                onPress={() => {
                  setImageUrl(null);
                  triggerAutoSave({
                    image: null,
                  });
                }}
                size="xs"
                variant="link"
              >
                Remover imagem
              </PrismButton>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <PrismLabel htmlFor="title">Nome</PrismLabel>
              {savingFields.has("title") && <ULoader />}
            </div>
            <PrismInput
              defaultValue={partner?.title}
              id="title"
              name="title"
              onBlur={(e) => handleBlurField("title", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-2">
                <PrismLabel htmlFor="short">Sigla (4 letras)</PrismLabel>
                {savingFields.has("short") && <ULoader />}
              </div>
              <PrismInput
                defaultValue={partner?.short}
                id="short"
                name="short"
                onBlur={(e) => handleBlurField("short", e.target.value)}
                required
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-2">
                <PrismLabel htmlFor="slug">Slug</PrismLabel>
                {savingFields.has("slug") && <ULoader />}
              </div>
              <PrismInput
                defaultValue={partner?.slug}
                disabled={!isNew}
                id="slug"
                name="slug"
                onBlur={(e) => handleBlurField("slug", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <PrismLabel
                htmlFor="context"
                id="context-label"
                onClick={() => document.getElementById("context")?.focus()}
              >
                Contexto
              </PrismLabel>
              {savingFields.has("context") && <ULoader />}
            </div>
            <input name="context" type="hidden" value={contextValue} />
            <div className="min-h-25 overflow-hidden rounded-2xl border border-transparent bg-input text-base transition-[color,box-shadow] duration-200 squircle focus-within:border-ring/60 focus-within:ring-3 focus-within:ring-ring/30 md:text-sm">
              <Suspense fallback={<PrismSkeleton className="h-full w-full" />}>
                <Tiptap
                  aria-labelledby="context-label"
                  id="context"
                  className="prose prose-sm dark:prose-invert h-full max-w-none focus:outline-none"
                  content={contextValue}
                  handleBlur={(content: string) => {
                    setContextValue(content);
                    triggerAutoSave({
                      context: content,
                    });
                  }}
                  isRounded
                />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <PrismLabel
                htmlFor="voice"
                id="voice-label"
                onClick={() => document.getElementById("voice")?.focus()}
              >
                Tom de Voz
              </PrismLabel>
              {savingFields.has("voice") && <ULoader />}
            </div>
            <input name="voice" type="hidden" value={voiceValue} />
            <div className="min-h-25 overflow-hidden rounded-2xl border border-transparent bg-input text-base transition-[color,box-shadow] duration-200 squircle focus-within:border-ring/60 focus-within:ring-3 focus-within:ring-ring/30 md:text-sm">
              <Suspense fallback={<PrismSkeleton className="h-full w-full" />}>
                <Tiptap
                  aria-labelledby="voice-label"
                  id="voice"
                  className="prose prose-sm dark:prose-invert h-full max-w-none focus:outline-none"
                  content={voiceValue}
                  handleBlur={(content: string) => {
                    setVoiceValue(content);
                    triggerAutoSave({
                      voice: content,
                    });
                  }}
                  isRounded
                />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <PrismLabel htmlFor="instagram_caption_tail">
                Assinatura do Instagram
              </PrismLabel>
              {savingFields.has("instagram_caption_tail") && <ULoader />}
            </div>
            <PrismTextarea
              className="min-h-20"
              defaultValue={partner?.instagram_caption_tail || ""}
              id="instagram_caption_tail"
              name="instagram_caption_tail"
              onBlur={(e) =>
                handleBlurField("instagram_caption_tail", e.target.value)
              }
              placeholder="#hashtags @mentions..."
            />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2 font-medium">
              <span>Usuários Vinculados</span>
              {savingFields.has("users_ids") && <ULoader />}
            </div>
            <UAvatarSelector
              initialSelectedIds={partner?.users_ids || []}
              minSelected={1}
              name="users_ids"
              onChange={(ids) => {
                setSelectedUsers(ids);
                triggerAutoSave({
                  users_ids: ids,
                });
              }}
              options={people.map((person) => ({
                id: person.user_id,
                fallback: person.initials,
                image: person.image || undefined,
                title: person.name,
                subtitle: person.surname || undefined,
              }))}
            />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2 font-medium">
              <span>Cores da Marca</span>
              {savingFields.has("colors") && <ULoader />}
            </div>
            <UPaletteEditor
              initialColors={partner?.colors || []}
              onChange={(colors) => {
                setBrandColors(colors);
                triggerAutoSave({
                  colors,
                });
              }}
            />
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2 font-medium">
              <div>
                <span>Datas Comemorativas da Marca</span>
                <p className="text-xs font-normal text-muted-foreground">
                  Selecione as datas comemorativas e feriados relevantes para
                  esta marca.
                </p>
              </div>
              {savingFields.has("holidays") && <ULoader />}
            </div>
            <UPartnerCelebrationsSelector
              celebrations={celebrations}
              selectedIds={selectedHolidays}
              isLoading={isLoadingCelebrations}
              onToggle={handleToggleHoliday}
              onClear={handleClearHolidays}
              saving={savingFields.has("holidays")}
            />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="grid w-full gap-4">
              <div className="flex items-center justify-between gap-2 font-medium">
                <span>Escopo de Trabalho (SOW)</span>
                {savingFields.has("sow") && <ULoader />}
              </div>
              <div className="flex w-full items-center gap-4">
                <input name="sow" type="hidden" value={sowValue} />
                <PrismToggleGroup className={"grid w-full grid-cols-3"}>
                  {sow_list.map((item) => (
                    <PrismToggleGroupItem
                      key={item.id}
                      className={"h-auto py-4"}
                      isSelected={sowValue === item.id}
                      onChange={(isSelected) => {
                        if (isSelected) {
                          setSowValue(item.id);
                          stateRef.current.sow = item.id;
                          triggerAutoSave({
                            sow: item.id,
                          });
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        {item.icon}
                        <div className="text-lg">{item.title}</div>
                      </div>
                    </PrismToggleGroupItem>
                  ))}
                </PrismToggleGroup>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-18 flex items-center justify-between gap-4">
          {isArchived && <input name="archived" type="hidden" value="on" />}
          <PrismToggle
            id="archived"
            isDisabled={isSubmitting}
            isSelected={isArchived}
            onChange={(selected) => {
              setIsArchived(selected);
              stateRef.current.archived = selected;
              triggerAutoSave({
                archived: selected,
              });
            }}
            variant="outline"
          >
            {isArchived ? "Arquivado" : "Visível"}
            {savingFields.has("archived") ? (
              <ULoader className="size-4" />
            ) : (
              <ArchiveIcon className="size-4" />
            )}
          </PrismToggle>

          <PrismButton
            className="rounded-2xl squircle"
            isDisabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              "Salvando..."
            ) : (
              <>
                Salvar Tudo <CloudIcon />
              </>
            )}
          </PrismButton>
        </div>
      </form>
      <AppBarSpacer />
    </div>
  );
}
