import { lazy, Suspense, useEffect, useState } from "react";
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
  // [ROLLBACK-REVALIDATION] type ShouldRevalidateFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Header } from "~/components/layout/Header";
import { getCleanAction } from "~/lib/helpers";
// [ROLLBACK-REVALIDATION] import { PERF_FLAGS } from "~/lib/perf";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
// [ROLLBACK-BOOTSTRAP] Imports do servidor removidos/comentados:
// import { getAllCelebrations } from "~/models/celebrations.server";
// import { getPartnersByUserId } from "~/models/partners.server";
// import { getAllVisiblePeople } from "~/models/people.server";
// import { getAllLateActions } from "~/models/actions.server";
import type { Person } from "~/models/people.server";
import { getUserId } from "~/services/auth.server";
import { getUserPreferences } from "~/lib/preferences";

import { Toaster } from "sonner";
import { GlobalSearchCommand } from "~/components/features/GlobalSearchCommand";
import type { Action } from "~/models/actions.server";
import { ActionShortcutProvider } from "~/hooks/useActionShortcut";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";


const CreateAndEditAction = lazy(() =>
  import("./CreateAndEditAction").then((module) => ({
    default: module.CreateAndEditAction,
  })),
);

// [ROLLBACK-BOOTSTRAP] Tipo original:
// export type AppLoaderData = {
//   people: Person[];
//   person: Person;
//   partners: Partner[];
//   celebrations: Celebration[];
//   lateActions: Action[];
//   cloudName: string;
//   uploadPreset: string;
// };
export type AppLoaderData = {
  person: Person;
  partners: Partner[];
  cloudName: string;
  uploadPreset: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  // [ROLLBACK-BOOTSTRAP] Bloco antigo com Promise.all de multiple queries e lateActions
  /*
  const [people, partners, celebrations] = await Promise.all([
    getAllVisiblePeople(supabase),
    getPartnersByUserId(supabase, user_id),
    getAllCelebrations(supabase),
  ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  invariant(person, "Person not found");

  const lateActions = await getAllLateActions(
    supabase,
    user_id,
    person.admin,
    partners.map((p) => p.slug),
  );

  invariant(person, "Person not found");
  invariant(people, "People not found");
  invariant(partners, "Partners not found");
  invariant(celebrations, "Priorities not found");
  */

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
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET!,
  } as AppLoaderData;
};


// [ROLLBACK-REVALIDATION] Bloco completo abaixo — descomentar para reverter
// export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
//   if (!PERF_FLAGS.SMART_REVALIDATION) return args.defaultShouldRevalidate;
//   if (args.formMethod && args.formMethod !== "GET") return true;
//   if (args.actionResult) return true;
//   return false;
// };

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

  useEffect(() => {
    if (typeof window !== "undefined" && person) {
      const prefs = getUserPreferences(person);
      localStorage.setItem("uzzina-accent-color-index", String(prefs.themeColorIndex));
      localStorage.setItem("uzzina-follow-partner-color", String(prefs.followPartnerColor));
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
            setOpenCmdK={setOpenCmdK}
          />
          <div className="flex h-full w-full overflow-hidden">
            <div className="grow overflow-x-hidden overflow-y-auto">
              <div className="flex min-h-full grow">
                <div className="flex min-h-full w-full shrink flex-col">
                  <Outlet context={{ BaseAction, setBaseAction }} />
                </div>
              </div>
            </div>
            <Toaster richColors />

            {BaseAction ? (
              <Suspense fallback={null}>
                <div
                  className="fixed inset-0 top-17 z-10 flex w-full shrink-0 flex-col bg-black/20 dark:bg-black/80"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setBaseAction(null);
                  }}
                ></div>
                <CreateAndEditAction
                  BaseAction={BaseAction}
                  onClose={() => setBaseAction(null)}
                />
              </Suspense>
            ) : null}
          </div>
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
