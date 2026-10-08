import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { ChevronUpIcon } from "lucide-react";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { resetQuerySession } from "~/lib/query-client";
const ActionFormDrawer = lazy(() =>
  import("~/components/features/action-drawer/ActionFormDrawer").then(
    (module) => ({
      default: module.ActionFormDrawer,
    }),
  ),
);
import { GlobalSearchCommand } from "~/components/features/GlobalSearchCommand";
import { AppBar } from "~/components/layout/AppBar";
import { Header } from "~/components/layout/Header";
import { ActionShortcutProvider } from "~/hooks/useActionShortcut";
import { MultiSelectionProvider } from "~/hooks/useMultiSelection";
import { createActionDraft, resolveDraftPartners } from "~/utils";
import { getUserPreferences } from "~/lib/preferences";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { cn } from "cnfast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { getOperationalPartners } from "~/models/partners";
import type { Action, Partner, Person } from "~/types";
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
  const [BaseAction, commitBaseAction] = useState<Action | null>(null);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const identityGeneration = useRef(0);
  const leaveGuardRef = useRef<(() => Promise<boolean>) | null>(null);
  const changingActionRef = useRef(false);
  const registerLeaveGuard = useCallback(
    (guard: (() => Promise<boolean>) | null) => {
      leaveGuardRef.current = guard;
    },
    [],
  );
  const setBaseAction = useCallback(async (next: Action | null) => {
    if (changingActionRef.current) return;
    changingActionRef.current = true;
    const generation = identityGeneration.current;
    try {
      if (
        (!leaveGuardRef.current || (await leaveGuardRef.current())) &&
        generation === identityGeneration.current
      ) {
        commitBaseAction(next);
        setDrawerVersion((version) => version + 1);
      }
    } finally {
      if (generation === identityGeneration.current)
        changingActionRef.current = false;
    }
  }, []);
  const [openCmdK, setOpenCmdK] = useState(false);
  const [partnerFilters, setPartnerFilters] = useState<string[]>([]);
  const location = useLocation();
  const [isAppBarVisible, setIsAppBarVisible] = useState(false);
  const [appBarTimeout, setAppBarTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const isHiddenByDefault =
    location.pathname !== "/app" && location.pathname !== "/app/";

  const queryClient = useQueryClient();

  // Query reativa para manter os parceiros sincronizados com o cache
  const { data: reactivePartners = partners } = useQuery({
    queryKey: QUERY_KEYS.operationalPartners(
      person?.user_id || "",
      !!person?.admin,
    ),
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      if (person?.user_id)
        return getOperationalPartners(supabase, person.user_id, person.admin);
      return partners;
    },
    enabled: !!person,
  });

  const visiblePartners = useMemo(
    () => reactivePartners.filter((partner) => !partner.archived),
    [reactivePartners],
  );

  useEffect(() => {
    if (typeof window !== "undefined" && person) {
      const prefs = getUserPreferences(person);
      localStorage.setItem("uzzina-theme", prefs.theme);
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
    let disposed = false;
    let identity: string | null | undefined;
    let authEvents = 0;
    function acceptSession(session: Session | null) {
      if (disposed) return;
      const nextIdentity = session?.user.id ?? null;
      if (identity === nextIdentity) return;
      identity = nextIdentity;
      const generation = ++identityGeneration.current;
      resetQuerySession(queryClient);
      setLoading(true);
      setPerson(null);
      setPartners([]);
      commitBaseAction(null);
      setPartnerFilters([]);
      setOpenCmdK(false);
      leaveGuardRef.current = null;
      changingActionRef.current = false;
      if (!nextIdentity) {
        void navigate({ to: "/login", replace: true });
        return;
      }
      // Leave the Auth callback before making another Supabase request.
      void Promise.resolve().then(async () => {
        if (disposed || generation !== identityGeneration.current) return;
        try {
          const { data: bootstrap, error } = await supabase.rpc(
            "get_app_bootstrap",
            { p_user_id: nextIdentity },
          );
          if (
            disposed ||
            generation !== identityGeneration.current ||
            identity !== nextIdentity
          )
            return;
          if (error || !bootstrap)
            throw error || new Error("Bootstrap unavailable");
          const data = bootstrap as { person: Person; partners: Partner[] };
          if (
            !data.person ||
            data.person.user_id !== nextIdentity ||
            !Array.isArray(data.partners)
          ) {
            throw new Error("Bootstrap identity mismatch");
          }
          const activePartners = data.partners.filter(
            (partner) => !partner.archived,
          );
          queryClient.setQueryData(
            QUERY_KEYS.operationalPartners(nextIdentity, data.person.admin),
            activePartners,
          );
          setPerson(data.person);
          setPartners(activePartners);
          setLoading(false);
        } catch (error) {
          if (disposed || generation !== identityGeneration.current) return;
          console.error("Falha no bootstrap da aplicação:", error);
          void navigate({ to: "/login", replace: true });
        }
      });
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEvents++;
      acceptSession(session);
    });
    const initialEvents = authEvents;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (authEvents === initialEvents) acceptSession(session);
    });
    return () => {
      disposed = true;
      identityGeneration.current++;
      subscription.unsubscribe();
    };
  }, [navigate, queryClient]);
  useEffect(() => {
    if (!person) return;
    const userId = person.user_id;
    function keyDownGlobal(event: KeyboardEvent) {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setOpenCmdK((prev) => !prev);
      } else if (
        event.code === "KeyA" &&
        event.altKey &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setBaseAction(
          createActionDraft({
            userId,
            partners: resolveDraftPartners({
              pathname:
                typeof window !== "undefined" ? window.location.pathname : "",
              partnerFilters,
            }),
          }),
        );
      }
    }
    document.addEventListener("keydown", keyDownGlobal, true);
    return () => document.removeEventListener("keydown", keyDownGlobal, true);
  }, [person, partnerFilters, setBaseAction]);
  if (loading || !person) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
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
      key={person.user_id}
      value={{
        person,
        partners: visiblePartners,
        cloudName,
        uploadPreset,
        setBaseAction,
        partnerFilters,
        setPartnerFilters,
      }}
    >
      <div className="flex h-screen flex-col" id="app">
        <ActionShortcutProvider>
          <MultiSelectionProvider
            locationKey={JSON.stringify([location.href, partnerFilters])}
          >
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
                    className="fixed inset-0 top-16 z-10 flex w-full shrink-0 cursor-default flex-col bg-black/20 dark:bg-black/80"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setBaseAction(null);
                    }}
                    tabIndex={-1}
                    type="button"
                  />
                  <ActionFormDrawer
                    key={`${BaseAction.id || "draft"}:${drawerVersion}`}
                    BaseAction={BaseAction}
                    onClose={() => commitBaseAction(null)}
                    registerLeaveGuard={registerLeaveGuard}
                    partnerFilters={partnerFilters}
                  />
                </Suspense>
              ) : null}
            </div>

            {!BaseAction && (
              <div
                className={cn(
                  "pointer-events-none fixed right-0 bottom-0 left-0 z-30 flex justify-center pb-4 transition-all duration-1000 ease-in-out",
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
                    partners={visiblePartners}
                    person={person}
                    setBaseAction={setBaseAction}
                    setOpenCmdK={setOpenCmdK}
                    setPartnerFilters={setPartnerFilters}
                  />
                </div>
              </div>
            )}

            {isHiddenByDefault && !isAppBarVisible && (
              <button
                aria-label="Revelar barra de navegação"
                className="pointer-events-auto fixed bottom-0 left-1/2 z-40 flex h-10 w-32 -translate-x-1/2 cursor-pointer items-end justify-center rounded-t-xl pb-2 transition-all hover:pb-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => {
                  setIsAppBarVisible(true);
                }}
                onMouseEnter={() => {
                  setIsAppBarVisible(true);
                }}
                type="button"
              >
                <ChevronUpIcon className="size-5 text-muted-foreground opacity-60 transition-opacity hover:opacity-100" />
              </button>
            )}

            <GlobalSearchCommand
              onOpenChange={setOpenCmdK}
              open={openCmdK}
              partners={visiblePartners}
              setBaseAction={setBaseAction}
            />
          </MultiSelectionProvider>
        </ActionShortcutProvider>
      </div>
    </AppContext.Provider>
  );
}
