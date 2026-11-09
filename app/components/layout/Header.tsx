import { filterOperationalActions } from "~/utils/partner-visibility";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { parseU } from "~/utils/date";
import {
  BellIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarIcon,
  CalendarRangeIcon,
  CheckIcon,
  HelpCircleIcon,
  LaptopIcon,
  LogOutIcon,
  MoonIcon,
  PaletteIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import {
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { usePreferencePersistence } from "~/hooks/usePreferencePersistence";
import { useAppContext } from "~/contexts/AppContext";
import {
  Theme,
  type ThemePreference,
  useAppThemeContext,
} from "~/hooks/useAppTheme";
import { useNotifications } from "~/hooks/useNotifications";
import { PALLETE } from "~/lib/palettes";
import { SIZE } from "~/lib/CONSTANTS";
import { getQuerySessionGeneration } from "~/lib/query-client";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  fetchAllLateActions,
  fetchHomeActions,
  fetchPartnerActions,
} from "~/lib/supabase.queries";
import { cn } from "cnfast";
import type { Notification } from "~/types";
import { notificationExcerptText } from "~/utils/sanitize";
import { DashboardMetrics } from "../features/home/DashboardMetrics";
import { UZZINALogo } from "../logo";
import { getActionById } from "~/models/actions";
import {
  PrismBadge,
  PrismButton,
  PrismMenu,
  PrismMenuContent,
  PrismMenuGroup,
  PrismMenuItem,
  PrismMenuLabel,
  PrismMenuSeparator,
  PrismMenuTrigger,
  PrismPopover,
  PrismPopoverTrigger,
} from "../prism";
import { UAvatar } from "../uzzina/UAvatar";
const DEFAULT_PARTNER_FILTERS: string[] = [];
type LeaveTarget = { kind: "page"; to: string } | { kind: "signOut" };
const samePath = (a: string, b: string) =>
  (a.replace(/\/+$/, "") || "/") === (b.replace(/\/+$/, "") || "/");
export function Header({
  person,
  setPrimaryAction,
  onBeforeLeave,
  partnerFilters = DEFAULT_PARTNER_FILTERS,
  scrollContainerRef,
}: {
  person: Person;
  setPrimaryAction: (action: Action | null) => Promise<boolean>;
  /** Requests closing every open action through its guard; false keeps the page. */
  onBeforeLeave: () => Promise<boolean>;
  partnerFilters?: string[];
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}) {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);
  useEffect(() => {
    const scroller = scrollContainerRef?.current;
    if (!scroller) return;
    const measure = () =>
      setScrollbarWidth(
        Math.max(0, scroller.offsetWidth - scroller.clientWidth),
      );
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(scroller);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scrollContainerRef]);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  // Each notification click or page change supersedes earlier pending requests.
  const intentRef = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      intentRef.current++;
    };
  }, []);
  const pathname = location.pathname;
  const lastPathnameRef = useRef(pathname);
  useEffect(() => {
    // A page change (including Back/Forward) makes pending notification loads obsolete.
    if (lastPathnameRef.current === pathname) return;
    lastPathnameRef.current = pathname;
    intentRef.current++;
  }, [pathname]);
  // One leave runs at a time; later requests only retarget it (sign-out outranks a page).
  const pendingLeaveRef = useRef<LeaveTarget | null>(null);
  const requestLeave = useCallback(
    async (target: LeaveTarget) => {
      setNotificationsOpen(false);
      const pending = pendingLeaveRef.current;
      if (pending) {
        if (pending.kind !== "signOut") pendingLeaveRef.current = target;
        return;
      }
      // Asking for the page already shown is a no-op that keeps open actions.
      if (target.kind === "page" && samePath(target.to, pathname)) return;
      pendingLeaveRef.current = target;
      const intent = ++intentRef.current;
      try {
        const allowed = await onBeforeLeave();
        const latest = pendingLeaveRef.current;
        if (
          !allowed ||
          !latest ||
          !mountedRef.current ||
          intent !== intentRef.current
        )
          return;
        if (latest.kind === "page") {
          const [pathname, queryString] = latest.to.split("?", 2);
          if (pathname === "/app/profile" && queryString) {
            const tab = new URLSearchParams(queryString).get("tab");
            if (tab === "appearance") {
              await navigate({ to: "/app/profile", search: { tab } });
              window.dispatchEvent(new Event("uzzina-profile-tab"));
            }
          } else if (pathname === "/app/planejamento" && queryString) {
            const partner = new URLSearchParams(queryString).get("partner");
            await navigate({
              to: "/app/planejamento",
              search: partner ? { partner } : {},
            });
          } else {
            await navigate({ to: latest.to });
          }
          return;
        }
        try {
          const { error } = await createSupabaseBrowserClient().auth.signOut();
          if (error) throw error;
        } catch {
          if (mountedRef.current)
            toast.error("Não foi possível sair. Tente novamente.");
        }
      } finally {
        pendingLeaveRef.current = null;
      }
    },
    [navigate, onBeforeLeave, pathname],
  );
  const leaveTo = useCallback(
    (to: string) => requestLeave({ kind: "page", to }),
    [requestLeave],
  );
  const signOut = useCallback(
    () => requestLeave({ kind: "signOut" }),
    [requestLeave],
  );
  // Plain clicks go through the action guards; modified clicks keep browser link behavior.
  const guardLinkClick =
    (to: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      void leaveTo(to);
    };
  const params = useParams({
    strict: false,
  });
  const search = location.search as Record<string, unknown>;
  const cleanPath = location.pathname.replace(/\/$/, "");
  const isHome = cleanPath === "/app";
  const isPartner = cleanPath.startsWith("/app/partner");
  const showMetrics = isHome || isPartner;

  // Get partners list from AppContext
  const { partners } = useAppContext();
  const partnerSlugs = partners.map((p) => p.slug).sort();
  const planningContextSlug =
    location.pathname.match(/^\/app\/partner\/([^/]+)\/?$/)?.[1] ??
    (location.pathname === "/app/planejamento" &&
    typeof location.search.partner === "string"
      ? location.search.partner
      : undefined);
  const planningPartnerSlug = partners.some(
    (partner) => partner.slug === planningContextSlug,
  )
    ? planningContextSlug
    : undefined;
  const planningTo = planningPartnerSlug
    ? `/app/planejamento?partner=${encodeURIComponent(planningPartnerSlug)}`
    : "/app/planejamento";

  // 1. Queries for Home page actions
  const now = new Date();
  const homeStartISO = startOfWeek(startOfMonth(now)).toISOString();
  const homeEndISO = endOfDay(endOfWeek(endOfMonth(now))).toISOString();
  const todayEndISO = endOfDay(now).toISOString();
  const { data: homeActions = [] as Action[] } = useQuery({
    queryKey: QUERY_KEYS.actions.list(
      "home",
      person.user_id,
      person.admin,
      partnerSlugs,
      homeStartISO,
      homeEndISO,
    ),
    queryFn: () =>
      fetchHomeActions(
        person.user_id,
        homeStartISO,
        homeEndISO,
        todayEndISO,
        partners.map((p) => p.slug),
      ),
    enabled: isHome,
  });
  const { data: homeLateActions = [] as Action[] } = useQuery({
    queryKey: QUERY_KEYS.actions.list(
      "late",
      person.user_id,
      person.admin,
      partnerSlugs,
    ),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p) => p.slug),
      ),
    enabled: isHome,
  });

  // 2. Queries for Partner page actions
  const slug = (params as Record<string, string | undefined>).slug;
  let partnerDate = typeof search?.date === "string" ? search.date : undefined;
  if (!partnerDate) {
    partnerDate = format(new Date().setDate(15), "yyyy-MM-dd");
  } else {
    partnerDate = isValid(new Date(partnerDate))
      ? format(parseU(partnerDate).setDate(15), "yyyy-MM-dd")
      : format(new Date().setDate(15), "yyyy-MM-dd");
  }
  const pStart = startOfDay(startOfWeek(startOfMonth(parseU(partnerDate))));
  const pEnd = endOfDay(endOfWeek(endOfMonth(parseU(partnerDate))));
  const pStartStr = format(pStart, "yyyy-MM-dd HH:mm:ss");
  const pEndStr = format(pEnd, "yyyy-MM-dd HH:mm:ss");
  const { data: partnerActions = [] as Action[] } = useQuery({
    queryKey: QUERY_KEYS.actions.list(
      "partner",
      person.user_id,
      person.admin,
      slug ? [slug] : [],
      pStartStr,
      pEndStr,
    ),
    queryFn: () =>
      fetchPartnerActions(
        slug || "",
        person.user_id,
        person.admin,
        pStartStr,
        pEndStr,
      ),
    enabled: isPartner && !!slug,
  });
  const { data: partnerAllLateActions = [] as Action[] } = useQuery({
    queryKey: QUERY_KEYS.actions.list(
      "late",
      person.user_id,
      person.admin,
      partnerSlugs,
    ),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p) => p.slug),
      ),
    enabled: isPartner && !!slug,
  });
  const partnerLateActions = useMemo(() => {
    if (!slug) return [];
    return partnerAllLateActions.filter((action) =>
      action.partners?.includes(slug),
    );
  }, [partnerAllLateActions, slug]);
  const referenceDate = isPartner && partnerDate ? parseU(partnerDate) : now;
  const filteredActions = useMemo(() => {
    const active = isHome ? homeActions : isPartner ? partnerActions : [];
    const operational = filterOperationalActions(active, partners);
    if (partnerFilters.length === 0) return operational;
    return operational.filter((action: Action) =>
      action.partners?.some((p: string) => partnerFilters.includes(p)),
    );
  }, [
    isHome,
    homeActions,
    isPartner,
    partnerActions,
    partnerFilters,
    partners,
  ]);
  const filteredLateActions = useMemo(() => {
    const active = isHome
      ? homeLateActions
      : isPartner
        ? partnerLateActions
        : [];
    const operational = filterOperationalActions(active, partners);
    if (partnerFilters.length === 0) return operational;
    return operational.filter((action: Action) =>
      action.partners?.some((p: string) => partnerFilters.includes(p)),
    );
  }, [
    isHome,
    homeLateActions,
    isPartner,
    partnerLateActions,
    partnerFilters,
    partners,
  ]);
  const handleNotificationClick = async (notif: Notification) => {
    const intent = ++intentRef.current;
    const generation = getQuerySessionGeneration(queryClient);
    const isCurrent = () =>
      mountedRef.current &&
      intent === intentRef.current &&
      generation === getQuerySessionGeneration(queryClient);
    // The popover must not cover the action while its detail loads.
    setNotificationsOpen(false);
    const supabase = createSupabaseBrowserClient();
    if (!notif.read_at) {
      markAsRead([notif.id]);
    }
    try {
      const actionData = await getActionById(supabase, notif.action_id);
      if (!isCurrent()) return;
      if (actionData) {
        await setPrimaryAction(actionData);
      }
    } catch (err) {
      if (!isCurrent()) return;
      console.error("Erro ao carregar ação mencionada:", err);
      toast.error("Não foi possível carregar o detalhe da ação.");
    }
  };
  return (
    <div
      className="border_after mx-2 flex items-center justify-between border-x border-transparent lg:mx-8"
      style={{ paddingRight: scrollbarWidth }}
    >
      <div className="flex items-center gap-2 py-4">
        {/* Logo */}
        <Link
          aria-label="Ir para o início da UZZINA"
          onClick={guardLinkClick("/app")}
          to="/app"
        >
          <UZZINALogo className="hidden h-8 sm:block" />
          <UZZINALogo className="h-8 sm:hidden" model="logo" />
        </Link>
      </div>

      {/* Central space for future stats */}
      <div className="flex-1 px-4 lg:px-8">
        {showMetrics && (
          <DashboardMetrics
            actions={filteredActions}
            lateActions={filteredLateActions}
            referenceDate={referenceDate}
            showToday={isHome}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <PrismPopoverTrigger
          isOpen={notificationsOpen}
          onOpenChange={setNotificationsOpen}
        >
          <PrismButton
            aria-label={
              unreadCount > 0
                ? `Notificações (${unreadCount} não lidas)`
                : "Notificações"
            }
            className="relative"
            size="icon-sm"
            variant="ghost"
          >
            <BellIcon className="size-5" />
            {unreadCount > 0 ? <PrismBadge>{unreadCount}</PrismBadge> : null}
          </PrismButton>
          <PrismPopover
            className="overflow-hidden p-0"
            placement="bottom end"
            size="lg"
          >
            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
              <h5 className="text-sm font-semibold">Notificações</h5>
              {unreadCount > 0 && (
                <PrismButton
                  className="h-auto p-0 font-normal"
                  onPress={() => markAllAsRead()}
                  size="xs"
                  variant="link"
                >
                  Marcar todas como lidas
                </PrismButton>
              )}
            </div>
            <div className="max-h-75 divide-y divide-border overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Nenhuma notificação nova.
                </div>
              ) : (
                notifications.map((notif) => {
                  const createdAtDate = new Date(notif.created_at);
                  const formattedDate = isValid(createdAtDate)
                    ? format(createdAtDate, "HH'h'mm 'de' dd/MM/yyyy")
                    : "";
                  return (
                    <PrismButton
                      key={notif.id}
                      className={cn(
                        "flex w-full flex-col items-start gap-1 px-4 py-2 text-left font-normal transition hover:bg-card focus-visible:bg-secondary/50",
                        !notif.read_at && "bg-card",
                      )}
                      onPress={() => handleNotificationClick(notif)}
                      variant="unstyled"
                    >
                      <div className="flex w-full items-start justify-between gap-1">
                        <span className="text-sm tracking-tight text-foreground/80">
                          <span className="font-bold">{notif.author_name}</span>{" "}
                          mencionou você na ação{" "}
                          <span className="font-bold">
                            {notif.action_title}
                          </span>{" "}
                          {formattedDate ? `às ${formattedDate}` : ""}
                        </span>
                        {!notif.read_at && (
                          <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 border-l pl-2 text-sm text-foreground/60">
                        {notificationExcerptText(notif.comment_excerpt)}
                      </p>
                    </PrismButton>
                  );
                })
              )}
            </div>
            <div className="border-t bg-muted/10 p-2 text-center">
              <Link
                className="block w-full py-1 text-sm hover:underline"
                onClick={guardLinkClick("/app/notifications")}
                to="/app/notifications"
              >
                Ver todas as notificações →
              </Link>
            </div>
          </PrismPopover>
        </PrismPopoverTrigger>

        <HeaderMenu
          onNavigate={(to) => void leaveTo(to)}
          onSignOut={() => void signOut()}
          planningTo={planningTo}
          person={person}
        />
      </div>
    </div>
  );
}
const THEME_OPTIONS: {
  id: ThemePreference;
  label: string;
  Icon: typeof SunIcon;
}[] = [
  { id: Theme.LIGHT, label: "Claro", Icon: SunIcon },
  { id: Theme.DARK, label: "Escuro", Icon: MoonIcon },
  { id: "system", label: "do sistema", Icon: LaptopIcon },
];

export const HeaderMenu = ({
  person,
  onNavigate,
  onSignOut,
  planningTo = "/app/planejamento",
}: {
  person: Person;
  /** Client-side page change after the open actions agree to close. */
  onNavigate: (to: string) => void;
  onSignOut: () => void;
  planningTo?: string;
}) => {
  const {
    theme,
    themePreference,
    setTheme,
    setPrimaryColorIndex,
    primaryColorIndex,
    followPartnerColor,
    setFollowPartnerColor,
  } = useAppThemeContext();
  const { queuePreference, retry, hasError } = usePreferencePersistence(person);
  const changeTheme = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    queuePreference({ theme: newTheme });
  };
  // Picking a swatch while partner colors are active also switches to the chosen color.
  const changeColorIndex = (index: number) => {
    setPrimaryColorIndex(index);
    if (followPartnerColor) {
      setFollowPartnerColor(false);
      queuePreference({ themeColorIndex: index, followPartnerColor: false });
    } else {
      queuePreference({ themeColorIndex: index });
    }
  };
  const changeFollowPartner = (value: boolean) => {
    setFollowPartnerColor(value);
    queuePreference({ followPartnerColor: value });
  };
  return (
    <PrismMenu>
      <PrismMenuTrigger>
        <PrismButton
          aria-label="Menu do perfil do usuário"
          className="relative cursor-pointer rounded-full"
          variant="unstyled"
        >
          <UAvatar
            fallback={person.short}
            image={person.image}
            size={SIZE.md}
          />
        </PrismButton>
      </PrismMenuTrigger>
      <PrismMenuContent className="w-64" placement="bottom end">
        <PrismMenuGroup>
          {hasError && (
            <PrismMenuItem
              onAction={retry}
              textValue="Tentar salvar preferências"
            >
              Tentar salvar preferências
            </PrismMenuItem>
          )}
          {THEME_OPTIONS.map(({ id, label, Icon }) => (
            <PrismMenuItem
              key={id}
              onAction={() => changeTheme(id)}
              textValue={`Tema ${label.toLowerCase()}`}
            >
              <Icon className="size-4" />
              <span>{`Tema ${label.toLowerCase()}`}</span>
              {themePreference === id ? (
                <CheckIcon className="ml-auto size-4 text-primary" />
              ) : null}
            </PrismMenuItem>
          ))}
        </PrismMenuGroup>

        <PrismMenuSeparator />

        <PrismMenuGroup
          aria-label="Origem das cores"
          disallowEmptySelection
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            if (selected === "partner" || selected === "palette")
              changeFollowPartner(selected === "partner");
          }}
          selectedKeys={new Set([followPartnerColor ? "partner" : "palette"])}
          selectionMode="single"
        >
          <PrismMenuLabel>Cores</PrismMenuLabel>
          <PrismMenuItem
            id="partner"
            shouldCloseOnSelect={false}
            textValue="Do parceiro"
          >
            <BriefcaseIcon /> Do parceiro
          </PrismMenuItem>
          <PrismMenuItem
            id="palette"
            shouldCloseOnSelect={false}
            textValue="Escolher cor"
          >
            <PaletteIcon /> Escolher cor
          </PrismMenuItem>
        </PrismMenuGroup>

        <PrismMenuGroup
          aria-label="Paleta de cores"
          className="grid grid-cols-6 gap-1 pt-1 pb-1"
        >
          {PALLETE.map((paletteConfig, i) => {
            const { light, dark } = paletteConfig;
            const currentColors = theme === Theme.DARK ? dark : light;
            const isSelected = primaryColorIndex === i;
            return (
              <PrismMenuItem
                key={paletteConfig.id}
                aria-label={paletteConfig.label}
                className={cn(
                  "mx-auto size-7 min-w-0 rounded-2xl p-1 transition-opacity squircle",
                  followPartnerColor && "opacity-30 focus:opacity-100",
                )}
                onAction={() => changeColorIndex(i)}
                shouldCloseOnSelect={false}
                style={{
                  backgroundColor: isSelected
                    ? `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`
                    : "",
                }}
                textValue={paletteConfig.label}
              >
                <div
                  className="size-5 rounded-[9px] squircle"
                  style={{
                    backgroundColor: isSelected
                      ? `oklch(${currentColors.bg.l} ${currentColors.bg.c} ${currentColors.bg.h})`
                      : `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`,
                  }}
                />
              </PrismMenuItem>
            );
          })}
          <PrismMenuItem
            aria-label="Personalizado"
            className={cn(
              "mx-auto size-7 min-w-0 rounded-2xl p-1 transition-opacity squircle",
              followPartnerColor && "opacity-30 focus:opacity-100",
            )}
            onAction={() => onNavigate("/app/profile?tab=appearance")}
            textValue="Personalizado"
          >
            <div
              className={cn(
                "flex size-5 items-center justify-center rounded-[9px] border squircle",
                primaryColorIndex === -1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              <PaletteIcon className="size-3" />
            </div>
          </PrismMenuItem>
        </PrismMenuGroup>

        <PrismMenuSeparator />

        <PrismMenuGroup>
          <PrismMenuItem
            onAction={() => onNavigate("/app/leads")}
            textValue="Leads"
          >
            <UsersIcon className="size-4" />
            Leads
          </PrismMenuItem>

          <PrismMenuItem
            onAction={() => onNavigate(planningTo)}
            textValue="Planejamento"
          >
            <CalendarRangeIcon className="size-4" />
            Planejamento
          </PrismMenuItem>

          <PrismMenuItem
            onAction={() => onNavigate("/app/profile")}
            textValue="Minha Conta"
          >
            <UserIcon className="size-4" />
            Minha Conta
          </PrismMenuItem>

          <PrismMenuItem
            onAction={() => onNavigate("/app/help")}
            textValue="Ajuda & Documentação"
          >
            <HelpCircleIcon className="size-4" />
            Ajuda & Documentação
          </PrismMenuItem>

          <PrismMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onAction={onSignOut}
            textValue="Sair"
            variant="destructive"
          >
            <LogOutIcon className="size-4" />
            Sair
          </PrismMenuItem>
        </PrismMenuGroup>

        {person.admin && (
          <>
            <PrismMenuSeparator />
            <PrismMenuGroup className="-mt-2 bg-secondary/20 px-2 pb-2">
              <PrismMenuLabel>Admin</PrismMenuLabel>
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/partners")}
                textValue="Parceiros"
              >
                <BriefcaseIcon className="size-4" />
                Parceiros
              </PrismMenuItem>
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/partner/new")}
                textValue="Novo Parceiro"
              >
                <PlusIcon className="size-4" />
                Novo Parceiro
              </PrismMenuItem>
              <PrismMenuSeparator />
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/users")}
                textValue="Usuários"
              >
                <UsersIcon className="size-4" />
                Usuários
              </PrismMenuItem>
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/user/new")}
                textValue="Novo Usuário"
              >
                <UserPlusIcon className="size-4" />
                Novo Usuário
              </PrismMenuItem>
              <PrismMenuSeparator />
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/clients")}
                textValue="Clientes"
              >
                <Building2Icon className="size-4" />
                Clientes
              </PrismMenuItem>
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/client/new")}
                textValue="Novo Cliente"
              >
                <PlusIcon className="size-4" />
                Novo Cliente
              </PrismMenuItem>
              <PrismMenuSeparator />
              <PrismMenuItem
                onAction={() => onNavigate("/app/admin/celebrations")}
                textValue="Datas Comemorativas"
              >
                <CalendarIcon className="size-4" />
                Datas Comemorativas
              </PrismMenuItem>
            </PrismMenuGroup>
          </>
        )}
      </PrismMenuContent>
    </PrismMenu>
  );
};
