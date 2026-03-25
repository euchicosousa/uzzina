import {
  Outlet,
  useLoaderData,
  redirect,
  useSearchParams,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import {
  getClientSession,
  dashSessionStorage,
} from "~/services/client-auth.server";
import { LogOutIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form } from "react-router";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { UAvatar } from "~/components/uzzina/UAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const meta: MetaFunction = () => [{ title: "Portal do Cliente" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // A página de login não precisa de auth
  if (url.pathname.startsWith("/dash/login")) {
    return {
      clientName: null,
      clientImage: null,
      partnerSlugs: [] as string[],
      partners: [] as any[],
    };
  }

  const { name, image, partners } = await getClientSession(request);
  return {
    name,
    image,
    partners,
  };
};

export const action = async ({ request }: { request: Request }) => {
  const session = await dashSessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  return redirect("/dash/login", {
    headers: {
      "Set-Cookie": await dashSessionStorage.destroySession(session),
    },
  });
};

export default function DashLayout() {
  const { name, image, partners } = useLoaderData<typeof loader>();
  const [params, setParams] = useSearchParams();

  const currentPartnerSlug = params.get("partner") || partners[0]?.slug;

  return (
    <div className="bg-background flex h-screen flex-col">
      {name && (
        <header className="border_after flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <UAvatar image={image} fallback={name} />
            <span className="text-muted-foreground truncate text-sm">
              Olá, <span className="text-foreground font-medium">{name}</span>
            </span>
          </div>

          {/* Seletor de Parceiro */}
          {partners.length > 0 && (
            <div className="flex max-w-xs items-center gap-3">
              {partners.length === 1 ? (
                <div className="flex items-center gap-2 rounded-xl px-3 py-1.5">
                  <span className="text-sm font-semibold">
                    {partners[0].title}
                  </span>
                </div>
              ) : (
                <Select
                  value={currentPartnerSlug}
                  onValueChange={(val) => setParams({ partner: val })}
                >
                  <SelectTrigger className="w-[180px] rounded-xl border-none text-sm font-semibold shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {partners.map((p: any) => (
                      <SelectItem key={p.slug} value={p.slug}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <Form method="post">
            <Button size="sm" variant="ghost" type="submit" className="gap-2">
              <LogOutIcon className="size-4" />
              Sair
            </Button>
          </Form>
        </header>
      )}
      <div className="flex min-h-0 flex-1">
        <MultiSelectionProvider>
          <Outlet context={{ setBaseAction: () => {} }} />
        </MultiSelectionProvider>
      </div>
    </div>
  );
}
