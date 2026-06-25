import type { Action, Person } from "~/types";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Header } from "~/components/layout/Header";
import { AppBar } from "~/components/layout/AppBar";
import { getCleanAction } from "~/lib/helpers";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { getUserId } from "~/services/auth.server";
import { getUserPreferences } from "~/lib/preferences";

import { Toaster } from "sonner";
import { GlobalSearchCommand } from "~/components/features/GlobalSearchCommand";
import { ActionShortcutProvider } from "~/hooks/useActionShortcut";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";

const CreateAndEditAction = lazy(() =>
  import("./CreateAndEditAction").then((module) => ({
    default: module.CreateAndEditAction,
  })),
);

export type AppLoaderData = {
  person: Person;
  partners: Partner[];
  cloudName: string;
  uploadPreset: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  // Nova chamada única utilizando a RPC get_app_bootstrap
  const { data: bootstrap, error } = await supabase.rpc("get_app_bootstrap", {
    p_user_id: user_id,
  });

  if (error || !bootstrap) {
    throw error || new Error("Falha no bootstrap da aplicação");
  }

  const { person, partners } = bootstrap as {
    person: Person;
    partners: Partner[];
  };

  invariant(person, "Person not found");
  invariant(partners, "Partners not found");

  return {
    person,
    partners,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
  } as AppLoaderData;
};

export const meta: MetaFunction = () => {
  return [
    { title: "ᴜᴢᴢɪɴa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function Dashboard() {
  const { person, partners } = useLoaderData<typeof loader>();
  const [BaseAction, setBaseAction] = useState<Action | null>(null);
  const [openCmdK, setOpenCmdK] = useState(false);
  const [partnerFilters, setPartnerFilters] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && person) {
      const prefs = getUserPreferences(person);
      localStorage.setItem(
        "uzzina-accent-color-index",
        String(prefs.themeColorIndex),
      );
      localStorage.setItem(
        "uzzina-follow-partner-color",
        String(prefs.followPartnerColor),
      );
      window.dispatchEvent(new Event("uzzina-storage-update"));
    }
  }, [person]);

  useEffect(() => {
    // Inicializa o client Supabase no browser para gerenciar o refresh do token
    // automaticamente. Quando o access token expira, o @supabase/ssr o renova
    // no browser e atualiza os cookies — evitando que o servidor precise fazer isso.
    const supabase = createSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event !== "INITIAL_SESSION") {
        // Se a sessão expirar e não puder ser renovada, redireciona para login
        window.location.href = "/login";
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function keyDownGlobal(event: KeyboardEvent) {
      if (event.key === "k" && event.metaKey) {
        setOpenCmdK((prev) => !prev);
      } else if (event.code === "KeyA" && event.altKey && event.metaKey) {
        setBaseAction({
          ...(getCleanAction({
            user_id: person.user_id,
          }) as unknown as Action),
        });
      }
    }
    document.addEventListener("keydown", keyDownGlobal);
    return () => document.removeEventListener("keydown", keyDownGlobal);
  }, [person.user_id]);

  return (
    <div id="app" className="flex h-screen flex-col">
      <ActionShortcutProvider>
        <MultiSelectionProvider>
          {/* HEADER */}

          <Header
            person={person}
            setBaseAction={setBaseAction}
            partnerFilters={partnerFilters}
          />
          <div className="flex h-full w-full overflow-hidden">
            <div className="grow overflow-x-hidden overflow-y-auto">
              <div className="flex min-h-full grow flex-col">
                <div className="flex min-h-full w-full shrink flex-col">
                  <Outlet
                    context={{
                      BaseAction,
                      setBaseAction,
                      partnerFilters,
                      setPartnerFilters,
                    }}
                  />
                </div>
              </div>
            </div>
            <Toaster richColors />

            {BaseAction ? (
              <Suspense fallback={null}>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Fechar painel de edição"
                  className="fixed inset-0 top-16 z-10 flex w-full shrink-0 flex-col bg-black/20 dark:bg-black/80 cursor-default"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setBaseAction(null);
                  }}
                />
                <CreateAndEditAction
                  BaseAction={BaseAction}
                  onClose={() => setBaseAction(null)}
                  partnerFilters={partnerFilters}
                />
              </Suspense>
            ) : null}
          </div>

          {!BaseAction && (
            <AppBar
              partners={partners}
              person={person}
              setBaseAction={setBaseAction}
              setOpenCmdK={setOpenCmdK}
              partnerFilters={partnerFilters}
              setPartnerFilters={setPartnerFilters}
            />
          )}

          <GlobalSearchCommand
            open={openCmdK}
            onOpenChange={setOpenCmdK}
            partners={partners}
            setBaseAction={setBaseAction}
          />
        </MultiSelectionProvider>
      </ActionShortcutProvider>
    </div>
  );
}
