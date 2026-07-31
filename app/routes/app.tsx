import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { ChevronUpIcon } from "lucide-react";
import { Suspense, lazy, useEffect, useState } from "react";
import invariant from "tiny-invariant";
const ActionFormDrawer = lazy(() =>
  import("~/components/features/action-drawer/ActionFormDrawer").then((module) => ({
    default: module.ActionFormDrawer,
  })),
);
import { GlobalSearchCommand } from "~/components/features/GlobalSearchCommand";
import { AppBar } from "~/components/layout/AppBar";
import { Header } from "~/components/layout/Header";
import { ActionShortcutProvider } from "~/hooks/useActionShortcut";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { getCleanAction } from "~/lib/helpers";
import { getUserPreferences } from "~/lib/preferences";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { cn } from "cnfast";
import type { Partner } from "~/types";
import { AppContext } from "~/contexts/AppContext";
import { UZZINALogo } from "~/components/logo";
export const Route = createFileRoute("/app")({
  component: Dashboard,
});
const cloudName =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || "dvfpxjskm";
const uploadPreset =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) ||
  "bussola_unsigned";
function Dashboard() {
  const [person, setPerson] = useState<Person | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [BaseAction, setBaseAction] = useState<Action | null>(null);
  const [openCmdK, setOpenCmdK] = useState(false);
  const [partnerFilters, setPartnerFilters] = useState<string[]>([]);
  const location = useLocation();
  const [isAppBarVisible, setIsAppBarVisible] = useState(false);
  const [appBarTimeout, setAppBarTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const isHiddenByDefault =
    location.pathname !== "/app" && location.pathname !== "/app/";
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
  const navigate = useNavigate();
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    async function initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate({
          to: "/login",
          replace: true,
        });
        return;
      }
      const { data: bootstrap, error } = await supabase.rpc(
        "get_app_bootstrap",
        {
          p_user_id: session.user.id,
        },
      );
      if (error || !bootstrap) {
        console.error("Falha no bootstrap da aplicação:", error);
        navigate({
          to: "/login",
          replace: true,
        });
        return;
      }
      const { person, partners } = bootstrap as {
        person: Person;
        partners: Partner[];
      };
      invariant(person, "Person not found");
      invariant(partners, "Partners not found");
      setPerson(person);
      setPartners(partners);
      setLoading(false);
    }
    initAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && event !== "INITIAL_SESSION") {
        navigate({
          to: "/login",
          replace: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  useEffect(() => {
    if (!person) return;
    const userId = person.user_id;
    function keyDownGlobal(event: KeyboardEvent) {
      if (event.key === "k" && event.metaKey) {
        setOpenCmdK((prev) => !prev);
      } else if (event.code === "KeyA" && event.altKey && event.metaKey) {
        setBaseAction({
          ...(getCleanAction({
            user_id: userId,
          }) as unknown as Action),
        });
      }
    }
    document.addEventListener("keydown", keyDownGlobal);
    return () => document.removeEventListener("keydown", keyDownGlobal);
  }, [person]);
  if (loading || !person) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background gap-4">
        <UZZINALogo className="h-24 scale-down opacity-20" model="logo" />
        {/* <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
         <p className="text-muted-foreground text-xl animate-pulse">
          Carregando UZZINA...
         </p> */}
      </div>
    );
  }
  return (
    <AppContext.Provider
      value={{
        person,
        partners,
        cloudName,
        uploadPreset,
        setBaseAction,
        partnerFilters,
        setPartnerFilters,
      }}
    >
      <div className="flex h-screen flex-col" id="app">
        <ActionShortcutProvider>
          <MultiSelectionProvider>
            {/* HEADER */}

            <Header
              partnerFilters={partnerFilters}
              person={person}
              setBaseAction={setBaseAction}
            />
            <div className="flex h-full w-full overflow-hidden">
              <div className="grow overflow-x-hidden overflow-y-auto">
                <div className="flex min-h-full grow flex-col">
                  <div className="flex min-h-full w-full shrink flex-col">
                    <Outlet />
                  </div>
                </div>
              </div>

              {BaseAction ? (
                <Suspense fallback={null}>
                  <button
                    aria-label="Fechar painel de edição"
                    className="fixed inset-0 top-16 z-10 flex w-full shrink-0 flex-col bg-black/20 dark:bg-black/80 cursor-default"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setBaseAction(null);
                    }}
                    tabIndex={-1}
                    type="button"
                  />
                  <ActionFormDrawer
                  BaseAction={BaseAction}
                  onClose={() => setBaseAction(null)}
                  partnerFilters={partnerFilters}
                />
                </Suspense>
              ) : null}
            </div>

            {!BaseAction && (
              <div
                className={cn(
                  "fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-4 transition-all duration-1000 ease-in-out  pointer-events-none",
                  isHiddenByDefault && !isAppBarVisible
                    ? "translate-y-28 opacity-0"
                    : "translate-y-0 opacity-100",
                )}
                onMouseEnter={() => {
                  if (appBarTimeout) {
                    clearTimeout(appBarTimeout);
                    setAppBarTimeout(null);
                  }
                  setIsAppBarVisible(true);
                }}
                onMouseLeave={() => {
                  if (isHiddenByDefault) {
                    const timer = setTimeout(() => {
                      setIsAppBarVisible(false);
                    }, 500);
                    setAppBarTimeout(timer);
                  }
                }}
              >
                <div className="pointer-events-auto">
                  <AppBar
                    partnerFilters={partnerFilters}
                    partners={partners}
                    person={person}
                    setBaseAction={setBaseAction}
                    setOpenCmdK={setOpenCmdK}
                    setPartnerFilters={setPartnerFilters}
                  />
                </div>
              </div>
            )}

            {isHiddenByDefault && !isAppBarVisible && (
              <div
                className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-32 h-10 flex justify-center items-end pb-2 cursor-pointer transition-all hover:pb-3 pointer-events-auto"
                onMouseEnter={() => {
                  setIsAppBarVisible(true);
                }}
              >
                <ChevronUpIcon className="size-5 text-muted-foreground opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            )}

            <GlobalSearchCommand
              onOpenChange={setOpenCmdK}
              open={openCmdK}
              partners={partners}
              setBaseAction={setBaseAction}
            />
          </MultiSelectionProvider>
        </ActionShortcutProvider>
      </div>
    </AppContext.Provider>
  );
}
