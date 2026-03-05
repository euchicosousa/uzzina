import {
  Archive,
  BadgeCheck,
  CloudUpload,
  MailCheck,
  Megaphone,
} from "lucide-react";
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Suspense, lazy, useState } from "react";
import { ColorListEditor } from "~/components/features/ColorListEditor";
import { PartnerUsersSelector } from "~/components/features/PartnerUsersSelector";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { UToggleInput } from "~/components/uzzina/UToggle";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "ADMIN — Editar Parceiro" }];
};

const Tiptap = lazy(() =>
  import("~/components/features/Tiptap").then((module) => ({
    default: module.Tiptap,
  })),
);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const { slug } = params;

  const { data: people } = await supabase
    .from("people")
    .select("*")
    .eq("visible", true)
    .order("name", { ascending: true });

  if (slug === "new" || !slug) {
    return { partner: null, people: people || [] };
  }

  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("slug", slug)
    .single();

  const partner = data as Partner;

  invariant(partner, "Partner not found");
  invariant(people, "People not found");

  return { partner, people };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const colors = formData.getAll("colors") as string[];

  const { slug } = params;
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
    img: (updates.img as string) || null,
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
      return { error: "Slug already exists" };
    }

    const { error } = await supabase.from("partners").insert(partnerData);
    if (error) throw error;

    return redirect(`/app/admin/partners/${partnerData.slug}`);
  } else {
    const { error } = await supabase
      .from("partners")
      .update(partnerData)
      .eq("slug", slug!);
    if (error) throw error;
  }

  return { success: true };
};

export default function AdminPartnerEditPage() {
  const { partner, people } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [contextValue, setContextValue] = useState(partner?.context || "");
  // @ts-ignore (voice doesn't strictly exist on Partner type yet if types aren't regenerated)
  const [voiceValue, setVoiceValue] = useState(partner?.voice || "");

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-8">
      <div className="flex justify-between gap-8">
        <h1 className="mb-8 text-2xl font-bold">
          {partner ? `Editar ${partner.title}` : "Novo Parceiro"}
        </h1>

        <Link to="/app/admin/partners" className="font-medium hover:underline">
          Parceiros
        </Link>
      </div>
      <Form
        method="post"
        className="flex flex-col gap-8"
        key={partner?.slug ?? "new"}
      >
        <div className="grid gap-8">
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="title">
              Nome
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={partner?.title}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              <label className="font-medium" htmlFor="short">
                Sigla (Short Name)
              </label>
              <Input
                id="short"
                name="short"
                defaultValue={partner?.short}
                required
              />
            </div>

            <div className="grid gap-4">
              <label className="font-medium" htmlFor="slug">
                Slug
              </label>
              <Input
                id="slug"
                name="slug"
                defaultValue={partner?.slug}
                required
              />
            </div>
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="context">
              Contexto
            </label>
            <input
              type="hidden"
              id="context"
              name="context"
              value={contextValue}
            />
            <div className="border-input focus-within:border-ring focus-within:ring-ring/50 min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-base shadow-sm transition-[color,box-shadow] focus-within:ring-[3px] md:text-sm">
              <Suspense
                fallback={
                  <div className="bg-muted h-full w-full animate-pulse" />
                }
              >
                <Tiptap
                  content={contextValue}
                  handleChange={(content) => setContextValue(content)}
                  className="prose prose-sm dark:prose-invert font-inter h-full max-w-none focus:outline-none"
                />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="voice">
              Tom de Voz
            </label>
            <input type="hidden" id="voice" name="voice" value={voiceValue} />
            <div className="border-input focus-within:border-ring focus-within:ring-ring/50 min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-base shadow-sm transition-[color,box-shadow] focus-within:ring-[3px] md:text-sm">
              <Suspense
                fallback={
                  <div className="bg-muted h-full w-full animate-pulse" />
                }
              >
                <Tiptap
                  content={voiceValue}
                  handleChange={(content) => setVoiceValue(content)}
                  className="prose prose-sm dark:prose-invert font-inter h-full max-w-none focus:outline-none"
                />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="instagram_caption_tail">
              Assinatura do Instagram
            </label>
            <Textarea
              id="instagram_caption_tail"
              name="instagram_caption_tail"
              defaultValue={partner?.instagram_caption_tail || ""}
              placeholder="#hashtags @mentions..."
              className="font-inter min-h-[80px]"
            />
          </div>

          <div className="grid gap-4">
            <div className="font-medium">Usuários Vinculados</div>
            <PartnerUsersSelector
              people={people}
              initialSelectedUserIds={partner?.users_ids || []}
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
                  type="radio"
                  id="sow-marketing"
                  name="sow"
                  value="marketing"
                  defaultChecked={partner?.sow === "marketing" || !partner?.sow}
                >
                  <Megaphone className="size-4" />
                  Marketing
                </UToggleInput>

                <UToggleInput
                  type="radio"
                  id="sow-socialmedia"
                  name="sow"
                  value="socialmedia"
                  defaultChecked={partner?.sow === "socialmedia"}
                >
                  <BadgeCheck className="size-4" />
                  Social Media
                </UToggleInput>

                <UToggleInput
                  type="radio"
                  id="sow-demand"
                  name="sow"
                  value="demand"
                  defaultChecked={partner?.sow === "demand"}
                >
                  <MailCheck className="size-4" />
                  Demand
                </UToggleInput>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <UToggleInput
            id="archived"
            name="archived"
            defaultChecked={partner?.archived || false}
            variant="destructive"
          >
            <Archive className="size-4" />
            {partner?.archived ? "Arquivado" : "Visível"}
          </UToggleInput>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="squircle rounded-2xl"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
            <CloudUpload className="size-4" />
          </Button>
        </div>
      </Form>
    </div>
  );
}
