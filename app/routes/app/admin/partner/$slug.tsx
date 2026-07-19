import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArchiveIcon,
  BadgeCheckIcon,
  CheckIcon,
  CloudUploadIcon,
  MailCheckIcon,
  MegaphoneIcon,
  PrinterIcon,
  UploadIcon,
} from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ColorListEditor } from "~/components/features/ColorListEditor";
import { PartnerTopicsEditor } from "~/components/features/PartnerTopicsEditor";
import type { PartnerTopic } from "~/types";
const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";
import { ULoader } from "~/components/uzzina/ULoader";
import { UToggleInput } from "~/components/uzzina/UToggle";
import { useAppContext } from "~/contexts/AppContext";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { fetchPeople } from "~/lib/supabase.queries";
import type { Partner } from "~/types";
export const Route = createFileRoute("/app/admin/partner/$slug")({
  component: AdminPartnerEditPage,
});
function AdminPartnerEditPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const appData = useAppContext();
  const isNew = slug === "new" || !slug;

  // Queries client-side
  const { data: people = [] } = useQuery({
    queryKey: ["people", "visible"],
    queryFn: fetchPeople,
  });
  const { data: partner, isLoading: isLoadingPartner } = useQuery({
    queryKey: ["partner", slug],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Partner;
    },
    enabled: !isNew,
  });
  const [contextValue, setContextValue] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [voiceValue, setVoiceValue] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [topics, setTopics] = useState<PartnerTopic[]>([]);
  const [justSaved, setJustSaved] = useState(false);
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());

  // Armazena valores atuais de formulário para referência rápida e mutações parciais
  const stateRef = useRef({
    title: "",
    short: "",
    slug: "",
    instagram_caption_tail: "",
    sow: "marketing" as "marketing" | "socialmedia" | "demand",
    archived: false,
  });

  // Inicializa estados quando o parceiro for carregado
  useEffect(() => {
    if (partner) {
      setContextValue(partner.context || "");
      setImageUrl(partner.image || null);
      setVoiceValue(partner.voice || "");
      setSelectedUsers(partner.users_ids || []);
      setBrandColors(partner.colors || []);
      setTopics(((partner.topics as unknown) as PartnerTopic[]) || []);
      stateRef.current = {
        title: partner.title || "",
        short: partner.short || "",
        slug: partner.slug || "",
        instagram_caption_tail: partner.instagram_caption_tail || "",
        sow: partner.sow || "marketing",
        archived: partner.archived || false,
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
        const { data: existing } = await supabase
          .from("partners")
          .select("id")
          .eq("slug", partnerData.slug)
          .single();
        if (existing) {
          throw new Error("Este slug já está em uso.");
        }
        const { error } = await supabase.from("partners").insert(partnerData);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("partners")
          .update(partnerData)
          .eq("slug", slug || "");
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partner", slug],
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
      topics: (topics as unknown) as import("types/database").Json,
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
      sow:
          (updates.sow as "marketing" | "socialmedia" | "demand") || "marketing",
      topics: (topics as unknown) as import("types/database").Json,
    };
    await saveMutation.mutateAsync(partnerData);
  };
  if (isLoadingPartner) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
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
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition hover:opacity-90"
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadIcon className="size-6 text-white" />
            </div>
          </CloudinaryUpload>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 font-medium">
              <span>Logotipo da Marca</span>
              {savingFields.has("image") && <ULoader />}
            </div>
            <div className="text-sm text-muted-foreground">
              Clique para fazer upload e recortar
            </div>
            {imageUrl && (
              <button
                className="mt-1 text-left text-xs text-muted-foreground underline hover:text-foreground"
                onClick={() => {
                  setImageUrl(null);
                  triggerAutoSave({
                    image: null,
                  });
                }}
                type="button"
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <label className="font-medium" htmlFor="title">
                Nome
              </label>
              {savingFields.has("title") && <ULoader />}
            </div>
            <Input
              defaultValue={partner?.title}
              id="title"
              name="title"
              onBlur={(e) => handleBlurField("title", e.target.value)}
              required
              variant="inset"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-2">
                <label className="font-medium" htmlFor="short">
                  Sigla (4 letras)
                </label>
                {savingFields.has("short") && <ULoader />}
              </div>
              <Input
                defaultValue={partner?.short}
                id="short"
                name="short"
                onBlur={(e) => handleBlurField("short", e.target.value)}
                required
                variant="inset"
              />
            </div>

            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-2">
                <label className="font-medium" htmlFor="slug">
                  Slug
                </label>
                {savingFields.has("slug") && <ULoader />}
              </div>
              <Input
                defaultValue={partner?.slug}
                disabled={!isNew}
                id="slug"
                name="slug"
                onBlur={(e) => handleBlurField("slug", e.target.value)}
                required
                variant="inset"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-2">
              <label className="font-medium" htmlFor="context">
                Contexto
              </label>
              {savingFields.has("context") && <ULoader />}
            </div>
            <input
              id="context"
              name="context"
              type="hidden"
              value={contextValue}
            />
            <div className="min-h-[100px] bg-input dark:bg-input/30 input-embossed px-3 py-2 text-base shadow-sm transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 md:text-sm rounded-2xl">
              <Suspense
                fallback={
                  <div className="h-full w-full animate-pulse bg-muted" />
                }
              >
                <Tiptap
                  className="prose prose-sm dark:prose-invert h-full max-w-none focus:outline-none rounded-2xl"
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
              <label className="font-medium" htmlFor="voice">
                Tom de Voz
              </label>
              {savingFields.has("voice") && <ULoader />}
            </div>
            <input id="voice" name="voice" type="hidden" value={voiceValue} />
            <div className="min-h-[100px] bg-input dark:bg-input/30 input-embossed px-3 py-2 text-base shadow-sm transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 md:text-sm">
              <Suspense
                fallback={
                  <div className="h-full w-full animate-pulse bg-muted" />
                }
              >
                <Tiptap
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
              <label className="font-medium" htmlFor="instagram_caption_tail">
                Assinatura do Instagram
              </label>
              {savingFields.has("instagram_caption_tail") && <ULoader />}
            </div>
            <Textarea
              className="min-h-[80px]"
              defaultValue={partner?.instagram_caption_tail || ""}
              id="instagram_caption_tail"
              name="instagram_caption_tail"
              onBlur={(e) =>
                handleBlurField("instagram_caption_tail", e.target.value)
              }
              placeholder="#hashtags @mentions..."
              variant="inset"
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
            <ColorListEditor
              initialColors={partner?.colors || []}
              onChange={(colors) => {
                setBrandColors(colors);
                triggerAutoSave({
                  colors,
                });
              }}
            />
          </div>

          <div className="grid gap-4 border rounded-2xl p-6 bg-input/10">
            <PartnerTopicsEditor
              topics={topics}
              brandColors={brandColors}
              isSaving={savingFields.has("topics")}
              onChange={(updatedTopics) => {
                setTopics(updatedTopics);
                triggerAutoSave({
                  topics: (updatedTopics as unknown) as import("types/database").Json,
                });
              }}
            />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-2 font-medium">
                <span>Escopo de Trabalho (SOW)</span>
                {savingFields.has("sow") && <ULoader />}
              </div>
              <div className="flex items-center gap-4">
                <UToggleInput
                  defaultChecked={partner?.sow === "marketing" || !partner?.sow}
                  id="sow-marketing"
                  name="sow"
                  onCheckedChange={(checked) => {
                    if (checked) {
                      stateRef.current.sow = "marketing";
                      triggerAutoSave({
                        sow: "marketing",
                      });
                    }
                  }}
                  type="radio"
                  value="marketing"
                >
                  <MegaphoneIcon className="size-4" />
                  Marketing
                </UToggleInput>

                <UToggleInput
                  defaultChecked={partner?.sow === "socialmedia"}
                  id="sow-socialmedia"
                  name="sow"
                  onCheckedChange={(checked) => {
                    if (checked) {
                      stateRef.current.sow = "socialmedia";
                      triggerAutoSave({
                        sow: "socialmedia",
                      });
                    }
                  }}
                  type="radio"
                  value="socialmedia"
                >
                  <BadgeCheckIcon className="size-4" />
                  Social Media
                </UToggleInput>

                <UToggleInput
                  defaultChecked={partner?.sow === "demand"}
                  id="sow-demand"
                  name="sow"
                  onCheckedChange={(checked) => {
                    if (checked) {
                      stateRef.current.sow = "demand";
                      triggerAutoSave({
                        sow: "demand",
                      });
                    }
                  }}
                  type="radio"
                  value="demand"
                >
                  <MailCheckIcon className="size-4" />
                  Demand
                </UToggleInput>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-18 flex items-center justify-between gap-4">
          <UToggleInput
            defaultChecked={partner?.archived || false}
            id="archived"
            name="archived"
            onCheckedChange={(checked) => {
              stateRef.current.archived = checked;
              triggerAutoSave({
                archived: checked,
              });
            }}
            variant="destructive"
          >
            {savingFields.has("archived") ? (
              <ULoader className="size-4 text-white" />
            ) : (
              <ArchiveIcon className="size-4" />
            )}
            {partner?.archived ? "Arquivado" : "Visível"}
          </UToggleInput>

          <Button
            className="rounded-2xl squircle"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              "Salvando..."
            ) : justSaved ? (
              <>
                Salvo <CheckIcon className="size-4" />
              </>
            ) : (
              <>
                {isNew ? "Criar Parceiro" : "Salvar"}
                <CloudUploadIcon className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
