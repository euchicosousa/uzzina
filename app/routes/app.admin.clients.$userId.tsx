import { useState } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UploadIcon } from "lucide-react";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";
import {
  getClientById,
  createClient,
  updateClient,
  archiveClient,
} from "~/models/clients.server";
import { getAllPartners } from "~/models/partners.server";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => [{ title: "Admin | Editar Cliente" }];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const { userId } = params;

  const partners = await getAllPartners(supabase);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!;

  const client =
    userId !== "new" ? await getClientById(supabase, userId as string) : null;

  return { client, partners, cloudName, uploadPreset };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const { userId } = params;

  // Arquivar cliente
  if (intent === "archive_client" && userId !== "new") {
    await archiveClient(supabase, userId!);
    return redirect("/app/admin/clients");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const image = (formData.get("image") as string) || null;
  const partnerSlugs = formData.getAll("partner_slugs") as string[];

  if (userId === "new") {
    if (!email || !password || !name) {
      return { error: "Nome, e-mail e senha são obrigatórios." };
    }
    await createClient(supabase, {
      name,
      email,
      password,
      image,
      partners: partnerSlugs,
    });
  } else {
    await updateClient(supabase, userId!, {
      name,
      email,
      password,
      image,
      partners: partnerSlugs,
    });
  }

  return redirect("/app/admin/clients");
};

export default function AdminClientPage() {
  const { client, partners, cloudName, uploadPreset } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isNew = !client;

  const [imageUrl, setImageUrl] = useState<string | null>(
    client?.image || null,
  );

  return (
    <div
      key={client?.id || "new"}
      className="mx-auto flex h-full w-full max-w-3xl flex-col p-8"
    >
      <div className="mb-8 flex items-center justify-between gap-8">
        <h1 className="pb-0 text-2xl font-bold">
          {isNew ? "Novo Cliente" : `Editar ${client.name}`}
        </h1>
        <Link to="/app/admin/clients" className="font-medium hover:underline">
          Voltar
        </Link>
      </div>

      <Form method="post" className="flex flex-col gap-8">
        <input type="hidden" name="image" value={imageUrl || ""} />

        {(actionData as any)?.error && (
          <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
            {(actionData as any).error}
          </div>
        )}

        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <CloudinaryUpload
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            folder="uzzina/clients"
            square
            outputWidth={400}
            onUpload={(url: string) => setImageUrl(url)}
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition hover:opacity-90"
          >
            <UAvatar
              key={imageUrl ?? "empty"}
              image={imageUrl}
              fallback={client?.name || "?"}
              size="2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadIcon className="size-6 text-white" />
            </div>
          </CloudinaryUpload>

          <div className="grid gap-1">
            <p className="font-medium">Foto de Perfil</p>
            <p className="text-muted-foreground text-sm">
              Clique para fazer upload e recortar
            </p>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-muted-foreground hover:text-foreground mt-1 text-left text-xs underline"
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <label className="font-medium" htmlFor="name">
            Nome
          </label>
          <Input
            id="name"
            name="name"
            defaultValue={client?.name || ""}
            required
            placeholder="Nome do cliente"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="email">
              E-mail
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email || ""}
              required
              placeholder="cliente@empresa.com"
            />
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="password">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="text"
              defaultValue={client?.password || ""}
              required
              placeholder="Senha de acesso"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="font-medium">Partners com acesso</div>
          <UAvatarSelector
            name="partner_slugs"
            options={partners
              .filter((p) => !p.archived)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((p) => ({
                id: p.slug,
                fallback: p.short,
                backgroundColor: p.colors[0],
                color: p.colors[1],
                title: p.title,
              }))}
            initialSelectedIds={client?.partners || []}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-6">
          {!isNew && (
            <div className="flex gap-2">
              <Button
                type="submit"
                name="intent"
                value="archive_client"
                variant="destructive"
                className="squircle bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-2xl"
                disabled={isSubmitting}
                onClick={(e) => {
                  if (
                    !confirm("Tem certeza que deseja ocultar este cliente?")
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                Arquivar Cliente
              </Button>
            </div>
          )}
          <Button
            type="submit"
            className="squircle ml-auto rounded-2xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : isNew ? "Criar Cliente" : "Salvar"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
