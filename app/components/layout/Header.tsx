import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { BellIcon, CheckIcon } from "lucide-react";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { Theme, useTheme } from "~/components/theme-provider";
import { useAppContext } from "~/contexts/AppContext";
import { useAppTheme } from "~/hooks/useAppTheme";
import { useNotifications } from "~/hooks/useNotifications";
import { PALLETE, SIZE } from "~/lib/CONSTANTS";
import { getThemeIcon } from "~/lib/helpers";
import { QUERY_KEYS } from "~/lib/query-keys";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import {
  fetchAllLateActions,
  fetchHomeActions,
  fetchPartnerActions,
} from "~/lib/supabase.queries";
import type { Json } from "types/database";
import { cn } from "~/lib/utils";
import type { Notification } from "~/types";
import { DashboardMetrics } from "../features/home/DashboardMetrics";
import { UZZINALogo } from "../logo";
import {
  PrismButton,
  PrismPopover,
  PrismPopoverContent,
} from "~/components/prism";
import { UAvatar } from "../uzzina/UAvatar";
import { UBadge } from "../uzzina/UBadge";
const DEFAULT_PARTNER_FILTERS: string[] = [];
export function Header({
  person,
  setBaseAction,
  partnerFilters = DEFAULT_PARTNER_FILTERS,
}: {
  person: Person;
  setBaseAction: (action: Action | null) => void;
  partnerFilters?: string[];
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const location = useLocation();
  const params = useParams({
    strict: false,
  });
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const cleanPath = location.pathname.replace(/\/$/, "");
  const isHome = cleanPath === "/app";
  const isPartner = cleanPath.startsWith("/app/partner");
  const showMetrics = isHome || isPartner;

  // Get partners list from AppContext
  const { partners } = useAppContext();

  // 1. Queries for Home page actions
  const now = new Date();
  const homeStartISO = startOfWeek(startOfMonth(now)).toISOString();
  const homeEndISO = endOfDay(endOfWeek(endOfMonth(now))).toISOString();
  const todayEndISO = endOfDay(now).toISOString();
  const { data: homeActions = [] } = useQuery<Action[]>({
    queryKey: QUERY_KEYS.actions.home(person.user_id),
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
  const { data: homeLateActions = [] } = useQuery<Action[]>({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
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
  let partnerDate = searchParams.get("date");
  if (!partnerDate) {
    partnerDate = format(new Date().setDate(15), "yyyy-MM-dd");
  } else {
    partnerDate = isValid(new Date(partnerDate))
      ? format(parseISO(partnerDate).setDate(15), "yyyy-MM-dd")
      : format(new Date().setDate(15), "yyyy-MM-dd");
  }
  const pStart = startOfDay(startOfWeek(startOfMonth(parseISO(partnerDate))));
  const pEnd = endOfDay(endOfWeek(endOfMonth(parseISO(partnerDate))));
  const pStartStr = format(pStart, "yyyy-MM-dd HH:mm:ss");
  const pEndStr = format(pEnd, "yyyy-MM-dd HH:mm:ss");
  const partnerDateRange = `${pStartStr}_${pEndStr}`;
  const { data: partnerActions = [] } = useQuery<Action[]>({
    queryKey: QUERY_KEYS.actions.partner(slug || "", partnerDateRange),
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
  const { data: partnerAllLateActions = [] } = useQuery<Action[]>({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
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
  const referenceDate = isPartner && partnerDate ? parseISO(partnerDate) : now;
  const filteredActions = useMemo(() => {
    const active = isHome ? homeActions : isPartner ? partnerActions : [];
    if (partnerFilters.length === 0) return active;
    return active.filter((action: Action) =>
      action.partners?.some((p: string) => partnerFilters.includes(p)),
    );
  }, [isHome, homeActions, isPartner, partnerActions, partnerFilters]);
  const filteredLateActions = useMemo(() => {
    const active = isHome
      ? homeLateActions
      : isPartner
        ? partnerLateActions
        : [];
    if (partnerFilters.length === 0) return active;
    return active.filter((action: Action) =>
      action.partners?.some((p: string) => partnerFilters.includes(p)),
    );
  }, [isHome, homeLateActions, isPartner, partnerLateActions, partnerFilters]);
  const handleNotificationClick = async (notif: Notification) => {
    const supabase = createSupabaseBrowserClient();
    if (!notif.read_at) {
      markAsRead([notif.id]);
    }
    try {
      const { data: actionData, error } = await supabase
        .from("actions")
        .select("*")
        .eq("id", notif.action_id)
        .single();
      if (error) throw error;
      if (actionData) {
        setBaseAction(actionData as unknown as Action);
      }
    } catch (err) {
      console.error("Erro ao carregar ação mencionada:", err);
      toast.error("Não foi possível carregar o detalhe da ação.");
    }
  };
  return (
    <div className="border_after flex w-full items-center justify-between px-2 lg:px-8">
      <div className="flex items-center gap-2 py-4">
        {/* Logo */}
        <Link to="/app">
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
        <PrismPopover>
          <PrismButton
            className="relative rounded-full"
            size="icon-sm"
            variant="ghost"
          >
            <BellIcon className="size-5" />
            {unreadCount > 0 ? (
              <UBadge
                className="absolute -top-1 -right-1"
                isDynamic
                size="sm"
                value={unreadCount}
              />
            ) : null}
          </PrismButton>
          <PrismPopoverContent
            className="w-80 overflow-hidden rounded-2xl p-0"
            placement="bottom end"
          >
            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
              <h5>Notificações</h5>
              {unreadCount > 0 && (
                <button
                  className="text-sm text-primary transition-colors hover:underline"
                  onClick={() => markAllAsRead()}
                  type="button"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-[300px] divide-y divide-border overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm">
                  Você não tem nenhuma notificação.
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    className={cn(
                      "flex w-full flex-col gap-1 py-2 px-4 text-left transition hover:bg-card",
                      !notif.read_at && "bg-card",
                    )}
                    onClick={() => handleNotificationClick(notif)}
                    type="button"
                  >
                    <div className="flex w-full items-start justify-between gap-1">
                      <span className="text-sm tracking-tight text-foreground/80">
                        <span className="font-bold">{notif.author_name}</span>{" "}
                        mencionou você na ação{" "}
                        <span className="font-bold">{notif.action_title}</span>{" "}
                        às{" "}
                        <span className="font-bold">
                          {format(notif.created_at, "hh'h'mm 'de' dd/MM/yyyy")}
                        </span>
                      </span>
                      {!notif.read_at && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 border-l pl-2 text-sm text-foreground/60">
                      {notif.comment_excerpt
                        ? notif.comment_excerpt.replace(/<[^>]*>/g, "")
                        : ""}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t bg-muted/10 p-2 text-center">
              <Link
                className="block w-full py-1 text-sm hover:underline"
                to="/app/notifications"
              >
                Ver todas as notificações →
              </Link>
            </div>
          </PrismPopoverContent>
        </PrismPopover>

        <HeaderMenu person={person} />
      </div>
    </div>
  );
}
const HeaderMenu = ({ person }: { person: Person }) => {
  const [theme, setTheme] = useTheme();
  const {
    setPrimaryColorIndex,
    primaryColorIndex,
    followPartnerColor,
    setFollowPartnerColor,
  } = useAppTheme();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPrefsRef = useRef<Record<string, unknown>>({});
  const queuePreference = (key: string, value: unknown) => {
    pendingPrefsRef.current[key] = value;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      const supabase = createSupabaseBrowserClient();
      const currentPrefs =
        person.preferences &&
        typeof person.preferences === "object" &&
        !Array.isArray(person.preferences)
          ? (person.preferences as Record<string, unknown>)
          : {};
      const updatedPrefs: Record<string, unknown> = {
        ...currentPrefs,
        ...pendingPrefsRef.current,
      };
      const { error } = await supabase
        .from("people")
        .update({
          preferences: updatedPrefs as unknown as Json,
        })
        .eq("user_id", person.user_id);
      if (error) {
        console.error("Error updating preferences:", error);
      }
      pendingPrefsRef.current = {};
    }, 300);
  };
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    queuePreference("theme", newTheme);
  };
  const changeColorIndex = (index: number) => {
    setPrimaryColorIndex(index);
    queuePreference("themeColorIndex", index);
  };
  const changeFollowPartner = (value: boolean) => {
    setFollowPartnerColor(value);
    queuePreference("followPartnerColor", value);
  };
  return (
    <PrismPopover>
      {/* Perfil */}
      <PrismButton
        aria-label="Menu do perfil do usuário"
        className="relative rounded-full"
        size="unstyled"
        variant="unstyled"
      >
        <UAvatar fallback={person.short} image={person.image} size={SIZE.md} />
      </PrismButton>
      <PrismPopoverContent
        className="w-64 overflow-hidden rounded-3xl p-2 bg-popover shadow-xl border flex flex-col gap-1"
        placement="bottom end"
      >
        {theme === Theme.DARK ? (
          <PrismButton
            className="font-medium text-muted-foreground hover:text-foreground hover:bg-secondary justify-between w-full h-9 px-3"
            onClick={() => changeTheme(Theme.LIGHT)}
            variant="ghost"
          >
            <span>Tema claro</span>
            {getThemeIcon(Theme.LIGHT, "size-4")}
          </PrismButton>
        ) : (
          <PrismButton
            className="font-medium text-muted-foreground hover:text-foreground hover:bg-secondary justify-between w-full h-9 px-3"
            onClick={() => changeTheme(Theme.DARK)}
            variant="ghost"
          >
            Tema escuro
            {getThemeIcon(Theme.DARK, "size-4")}
          </PrismButton>
        )}
        <PrismButton
          className={cn(
            "w-full justify-between font-medium text-muted-foreground hover:text-foreground hover:bg-secondary h-9 px-3",
            followPartnerColor ? "bg-secondary" : "",
          )}
          onClick={() => changeFollowPartner(!followPartnerColor)}
          variant="ghost"
        >
          Cores do parceiro
          {followPartnerColor ? <CheckIcon className="size-4" /> : null}
        </PrismButton>

        <hr className="my-1 -mx-2" />
        <div className="grid grid-cols-6 justify-between p-2">
          {PALLETE.map((paletteConfig, i) => {
            const { light, dark } = paletteConfig;
            const currentColors = theme === Theme.DARK ? dark : light;
            const isSelected = primaryColorIndex === i;
            return (
              <PrismButton
                key={paletteConfig.id}
                className="flex justify-center rounded-xl p-2 squircle"
                onClick={() => {
                  changeColorIndex(i);
                }}
                size="icon-sm"
                style={{
                  backgroundColor: isSelected
                    ? `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`
                    : "",
                }}
                title={paletteConfig.label}
                type="button"
                variant={"ghost"}
              >
                <div
                  className="size-4 rounded-lg"
                  style={{
                    backgroundColor: isSelected
                      ? `oklch(${currentColors.bg.l} ${currentColors.bg.c} ${currentColors.bg.h})`
                      : `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`,
                  }}
                />
              </PrismButton>
            );
          })}
        </div>

        <hr className="my-1 -mx-2" />

        <Link
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          to="/app/profile"
        >
          Minha Conta
        </Link>
        <PrismButton
          className="w-full justify-start font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 h-9 px-3"
          onClick={async () => {
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
          }}
          variant="ghost"
        >
          Sair
        </PrismButton>

        <hr className="my-1 -mx-2" />

        <Link
          className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          to="/app/help"
        >
          Ajuda & Documentação
        </Link>

        {person.admin && (
          <div className="bg-card px-2 pb-2 rounded-b-xl -mx-2 -mb-2 mt-1">
            <hr className="mb-2 -mx-2" />
            <div className="px-3 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Admin
            </div>

            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              to="/app/admin/partners"
            >
              Parceiros
            </Link>
            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              params={{
                slug: "new",
              }}
              to="/app/admin/partner/$slug"
            >
              Novo Parceiro
            </Link>
            <hr className="my-2 -mx-2" />
            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              to="/app/admin/users"
            >
              Usuários
            </Link>
            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              params={{
                userId: "new",
              }}
              to="/app/admin/user/$userId"
            >
              Novo Usuário
            </Link>
            <hr className="my-2 -mx-2" />
            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              to="/app/admin/clients"
            >
              Clientes
            </Link>
            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              params={{
                userId: "new",
              }}
              to="/app/admin/client/$userId"
            >
              Novo Cliente
            </Link>
            <hr className="my-2 -mx-2" />
            <Link
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-xl squircle text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              to="/app/admin/celebrations"
            >
              Datas Comemorativas
            </Link>
          </div>
        )}
      </PrismPopoverContent>
    </PrismPopover>
  );
};
