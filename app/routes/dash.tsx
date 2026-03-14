import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { createSupabaseClient } from "~/lib/supabase";
import { getClientSession } from "~/services/client-auth.server";
import { LogOutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form } from "react-router";

export const meta: MetaFunction = () => [{ title: "Portal do Cliente" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // A página de login não precisa de auth
  if (url.pathname.startsWith("/dash/login")) {
    return { clientName: null, partnerSlugs: [] as string[] };
  }

  const { clientName, partnerSlugs } = await getClientSession(request);
  return { clientName, partnerSlugs };
};

export const action = async ({ request }: { request: Request }) => {
  const { supabase, headers } = createSupabaseClient(request);
  await supabase.auth.signOut();
  return new Response(null, {
    status: 302,
    headers: { ...Object.fromEntries(headers), Location: "/dash/login" },
  });
};

export default function DashLayout() {
  const { clientName } = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen flex-col bg-background">
      {clientName && (
        <header className="border_after flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              U
            </div>
            <span className="text-sm text-muted-foreground">
              Olá, <span className="font-medium text-foreground">{clientName}</span>
            </span>
          </div>
          <Form method="post">
            <Button size="sm" variant="ghost" type="submit" className="gap-2">
              <LogOutIcon className="size-4" />
              Sair
            </Button>
          </Form>
        </header>
      )}
      <div className="flex min-h-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
