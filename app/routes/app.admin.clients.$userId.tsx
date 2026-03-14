import { createClient } from "@supabase/supabase-js";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import type { Database } from "types/database";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";
import { UToggleInput } from "~/components/uzzina/UToggle";
import {
  groupClients,
  getAllClients,
  upsertClientPartners,
} from "~/models/clients.server";
import { getAllPartners } from "~/models/partners.server";
import { getUserId } from "~/services/auth.server";
import { SendIcon } from "lucide-react";

export const meta: MetaFunction = () => [{ title: "Admin | Editar Cliente" }];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const { userId } = params;
  const [allClients, partners] = await Promise.all([
    getAllClients(supabase),
    getAllPartners(supabase),
  ]);

  const grouped = groupClients(allClients);
  const client =
    userId !== "new"
      ? (grouped.find((c) => c.user_id === userId) ?? null)
      : null;

  return { client, partners };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const { userId } = params;

  const supabaseAdmin = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Enviar magic link para o e-mail do cliente
  if (intent === "send_magic_link") {
    const email = formData.get("email") as string;
    if (!email) return { error: "E-mail obrigatório" };
    await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${new URL(request.url).origin}/dash/home`,
    });
    return { success: "Magic link enviado para " + email };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const partnerSlugs = formData.getAll("partner_slugs") as string[];

  if (userId === "new") {
    // Cria o usuário via Auth admin (magic link no primeiro acesso)
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { name },
        redirectTo: `${new URL(request.url).origin}/dash/home`,
      });

    if (authError) return { error: authError.message };
    if (!authUser.user) return { error: "Falha ao criar usuário" };

    await upsertClientPartners(
      supabase,
      authUser.user.id,
      name,
      partnerSlugs,
    );
  } else {
    // Atualiza os partners do cliente existente
    await upsertClientPartners(supabase, userId!, name, partnerSlugs);
  }

  return redirect("/app/admin/clients");
};

export default function AdminClientPage() {
  const { client, partners } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isNew = !client;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-8">
      <div className="mb-8 flex items-center justify-between gap-8">
        <h1 className="pb-0 text-2xl font-bold">
          {isNew ? "Novo Cliente" : `Editar ${client.name}`}
        </h1>
        <Link to="/app/admin/clients" className="font-medium hover:underline">
          Voltar
        </Link>
      </div>

      <Form method="post" className="flex flex-col gap-8">
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

        {isNew && (
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="email">
              E-mail (receberá o convite de acesso)
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="cliente@empresa.com"
            />
          </div>
        )}

        <div className="grid gap-4">
          <div className="font-medium">Partners com acesso</div>
          <UAvatarSelector
            name="partner_slugs"
            isSquircle
            options={partners
              .filter((p) => !p.archived)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((p) => ({
                id: p.slug,
                fallback: p.short,
                backgroundColor: p.colors[0],
                color: p.colors[1],
                title: p.short,
                subtitle: p.title,
              }))}
            initialSelectedIds={client?.partner_slugs || []}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-6">
          {!isNew && (
            <Button
              type="submit"
              name="intent"
              value="send_magic_link"
              variant="secondary"
              className="squircle rounded-2xl"
              disabled={isSubmitting}
            >
              <SendIcon className="size-4" />
              Reenviar Magic Link
            </Button>
          )}
          <Button
            type="submit"
            className="squircle ml-auto rounded-2xl"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Salvando..."
              : isNew
                ? "Criar e Convidar"
                : "Salvar"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
