import {
  ArchiveIcon,
  BadgeCheckIcon,
  CloudUploadIcon,
  MailCheckIcon,
  MegaphoneIcon,
  PrinterIcon,
} from "lucide-react";
import {
  Form,
  Link,
  useLoaderData,
  useRouteLoaderData,
  useNavigation,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Suspense, lazy, useState } from "react";
import { ColorListEditor } from "~/components/features/ColorListEditor";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { UToggleInput } from "~/components/uzzina/UToggle";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { getUserId } from "~/services/auth.server";
import { UploadIcon } from "lucide-react";
import type { AppLoaderData } from "~/routes/app";
export const meta: MetaFunction = () => {
  return [
    {
      title: "ADMIN — Editar Parceiro",
    },
  ];
};
const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const { slug } = params;
  if (slug === "new" || !slug) {
    const { data: people } = await supabase
      .from("people")
      .select("*")
      .eq("visible", true)
      .order("name", {
        ascending: true,
      });
    return {
      partner: null,
      people: people || [],
    };
  }
  const [peopleResult, partnerResult] = await Promise.all([
    supabase.from("people").select("*").eq("visible", true).order("name", {
      ascending: true,
    }),
    supabase.from("partners").select("*").eq("slug", slug).single(),
  ]);
  const { data: people } = peopleResult;
  const { data: partnerData } = partnerResult;
  const partner = partnerData as Partner;
  if (!partner) {
    return redirect("/app/admin/partners");
  }
  invariant(partner, "Partner not found");
  invariant(people, "People not found");
  return {
    partner,
    people,
  };
};
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const [auth, formData] = await Promise.all([
    getUserId(request),
    request.formData(),
  ]);
  const { supabase } = auth;
  const updates = Object.fromEntries(formData);
  const colors = formData.getAll("colors") as string[];
  const { slug } = params;
  if (!slug) {
    throw new Error("Slug is required");
  }
  const isNew = slug === "new";
  const partnerData = {
    title: updates.title as string,
    slug: updates.slug as string,
    colors: colors.length > 0 ? colors : ["#000000", "#ffffff"],
    archived: updates.archived === "on",
    users_ids: formData.getAll("users_ids") as string[],
    short: (updates.short as string) || "",
    context: (updates.context as string) || null,
    voice: (updates.voice as string) || null,
    image: (updates.image as string) || null,
    instagram_caption_tail: (updates.instagram_caption_tail as string) || null,
    sow: (updates.sow as "marketing" | "socialmedia" | "demand") || "marketing",
  };
  if (isNew) {
    const { data: existing } = await supabase
      .from("partners")
      .select("id")
      .eq("slug", partnerData.slug)
      .single();
    if (existing) {
      return {
        error: "Slug already exists",
      };
    }
    const { error } = await supabase.from("partners").insert(partnerData);
    if (error) throw error;
    return redirect(`/app/admin/partner/${partnerData.slug}`);
  } else {
    const { error } = await supabase
      .from("partners")
      .update(partnerData)
      .eq("slug", slug);
    if (error) throw error;
  }
  return {
    success: true,
  };
};
export default function AdminPartnerEditPage() {
  const { partner, people } = useLoaderData<typeof loader>();
  const appData = useRouteLoaderData("routes/app") as AppLoaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [contextValue, setContextValue] = useState(partner?.context || "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    partner?.image || null,
  );
  const [voiceValue, setVoiceValue] = useState(partner?.voice || "");
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
          <Link
            className="hover:underline"
            to={`/print/partner/${partner?.slug}`}
          >
            <PrinterIcon className="size-5" />
          </Link>
        </div>
      </div>
      <Form
        key={partner?.slug ?? "new"}
        className="flex flex-col gap-8"
        method="post"
      >
        <input name="image" type="hidden" value={imageUrl || ""} />

        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <CloudinaryUpload
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition hover:opacity-90"
            cloudName={appData.cloudName}
            folder="uzzina/partners"
            onUpload={(url: string) => setImageUrl(url)}
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

          <div className="flex flex-col gap-1">
            <div className="font-medium">Logotipo da Marca</div>
            <div className="text-sm text-muted-foreground">
              Clique para fazer upload e recortar
            </div>
            {imageUrl && (
              <button
                className="mt-1 text-left text-xs text-muted-foreground underline hover:text-foreground"
                onClick={() => setImageUrl(null)}
                type="button"
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-8">
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="title">
              Nome
            </label>
            <Input
              defaultValue={partner?.title}
              id="title"
              name="title"
              required
              variant="inset"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              <label className="font-medium" htmlFor="short">
                Sigla (4 letras)
              </label>
              <Input
                defaultValue={partner?.short}
                id="short"
                name="short"
                required
                variant="inset"
              />
            </div>

            <div className="grid gap-4">
              <label className="font-medium" htmlFor="slug">
                Slug
              </label>
              <Input
                defaultValue={partner?.slug}
                id="slug"
                name="slug"
                required
                variant="inset"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="context">
              Contexto
            </label>
            <input
              id="context"
              name="context"
              type="hidden"
              value={contextValue}
            />
            <div className="min-h-[100px] bg-input dark:bg-input/30 input-embossed px-3 py-2 text-base shadow-sm transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 md:text-sm">
              <Suspense
                fallback={
                  <div className="h-full w-full animate-pulse bg-muted" />
                }
              >
                <Tiptap
                  className="prose prose-sm dark:prose-invert h-full max-w-none focus:outline-none"
                  content={contextValue}
                  handleChange={(content) => setContextValue(content)}
                />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="voice">
              Tom de Voz
            </label>
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
                  handleChange={(content) => setVoiceValue(content)}
                />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="instagram_caption_tail">
              Assinatura do Instagram
            </label>
            <Textarea
              className="min-h-[80px]"
              defaultValue={partner?.instagram_caption_tail || ""}
              id="instagram_caption_tail"
              name="instagram_caption_tail"
              placeholder="#hashtags @mentions..."
              variant="inset"
            />
          </div>

          <div className="grid gap-4">
            <div className="font-medium">Usuários Vinculados</div>
            <UAvatarSelector
              initialSelectedIds={partner?.users_ids || []}
              name="users_ids"
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
            <div className="font-medium">Cores da Marca</div>
            <ColorListEditor initialColors={partner?.colors || []} />
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="grid gap-4">
              <div className="font-medium">Escopo de Trabalho (SOW)</div>
              <div className="flex items-center gap-4">
                <UToggleInput
                  defaultChecked={partner?.sow === "marketing" || !partner?.sow}
                  id="sow-marketing"
                  name="sow"
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
            variant="destructive"
          >
            <ArchiveIcon className="size-4" />
            {partner?.archived ? "Arquivado" : "Visível"}
          </UToggleInput>

          <Button
            className="rounded-2xl squircle"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
            <CloudUploadIcon className="size-4" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
