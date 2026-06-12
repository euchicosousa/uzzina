import { CheckIcon, BellIcon } from "lucide-react";
import { Link, useFetcher, useFetchers, useNavigation } from "react-router";
import { toast } from "sonner";
import { useNotifications } from "~/hooks/useNotifications";
import type { Notification } from "~/models/notifications.server";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { Theme, useTheme } from "remix-themes";
import { useAppTheme } from "~/hooks/useAppTheme";
import { PALLETE, SIZE } from "~/lib/CONSTANTS";
import { getThemeIcon } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { UzzinaLogo } from "../logo";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { UAvatar } from "../uzzina/UAvatar";
import { UBadge } from "../uzzina/UBadge";
import { useRef } from "react";

export function Header({
  person,
  setBaseAction,
}: {
  person: Person;
  setBaseAction: (action: Action | null) => void;
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

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
          <UzzinaLogo className="hidden h-8 sm:block" />
          <UzzinaLogo className="h-8 sm:hidden" model="logo" />
        </Link>
      </div>

      {/* Central space for future stats */}
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <BellIcon className="size-5" />
              {unreadCount > 0 ? (
                <UBadge
                  size="sm"
                  value={unreadCount}
                  isDynamic
                  className="absolute -top-1 -right-1"
                />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 overflow-hidden rounded-2xl border border-border p-0 shadow-xl"
            align="end"
          >
            <div className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Notificações
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs font-medium text-primary transition-colors hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            <div className="max-h-[300px] divide-y divide-border overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Você não tem nenhuma notificação.
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "flex w-full flex-col gap-1 p-4 text-left transition hover:bg-muted/50",
                      !notif.read_at && "bg-primary/5",
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        {notif.author_name} mencionou você
                      </span>
                      {!notif.read_at && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="line-clamp-1 text-[11px] font-medium text-muted-foreground">
                      na ação: {notif.action_title}
                    </span>
                    <p className="mt-1 line-clamp-2 rounded-lg border border-border/50 bg-muted/30 p-2 text-xs text-foreground/80">
                      {notif.comment_excerpt}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t bg-muted/10 p-2 text-center">
              <Link
                to="/app/notifications"
                className="block w-full py-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Ver todas as notificações →
              </Link>
            </div>
          </PopoverContent>
        </Popover>

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
  const fetchers = useFetchers();
  const navigation = useNavigation();
  const isLoading = fetchers.length > 0 || navigation.state !== "idle";
  const fetcher = useFetcher();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPrefsRef = useRef<Record<string, string>>({});

  const queuePreference = (key: string, value: string) => {
    pendingPrefsRef.current[key] = value;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetcher.submit(pendingPrefsRef.current, {
        method: "post",
        action: "/action/set-preferences",
      });
      pendingPrefsRef.current = {};
    }, 300);
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    queuePreference("theme", newTheme);
  };

  const changeColorIndex = (index: number) => {
    setPrimaryColorIndex(index);
    queuePreference("themeColorIndex", String(index));
  };

  const changeFollowPartner = (value: boolean) => {
    setFollowPartnerColor(value);
    queuePreference("followPartnerColor", String(value));
  };

  return (
    <DropdownMenu>
      {/* Perfil */}
      <DropdownMenuTrigger className="relative outline-none">
        {isLoading && (
          <div className="absolute top-0 left-0 size-11 -translate-1.5 animate-spin rounded-full border-4 border-primary border-b-transparent"></div>
        )}
        <UAvatar size={SIZE.md} fallback={person.short} image={person.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-2">
        {theme === Theme.DARK ? (
          <DropdownMenuItem onClick={() => changeTheme(Theme.LIGHT)}>
            {getThemeIcon(Theme.LIGHT, "size-4")} Tema claro
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => changeTheme(Theme.DARK)}>
            {getThemeIcon(Theme.DARK, "size-4")} Tema escuro
          </DropdownMenuItem>
        )}
        <div className="grid grid-cols-6 justify-between p-2">
          {PALLETE.map((paletteConfig, i) => {
            const { light, dark } = paletteConfig;
            const currentColors = theme === Theme.DARK ? dark : light;
            const isSelected = primaryColorIndex === i;
            return (
              <button
                onClick={() => {
                  changeColorIndex(i);
                }}
                key={paletteConfig.id}
                title={paletteConfig.label}
                className="squircle flex justify-center rounded-xl p-2 hover:opacity-80"
                style={{
                  backgroundColor: isSelected
                    ? `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`
                    : "",
                }}
              >
                <div
                  style={{
                    backgroundColor: isSelected
                      ? `oklch(${currentColors.bg.l} ${currentColors.bg.c} ${currentColors.bg.h})`
                      : `oklch(${currentColors.primary.l} ${currentColors.primary.c} ${currentColors.primary.h})`,
                  }}
                  className={`size-4 rounded-lg`}
                ></div>
              </button>
            );
          })}
        </div>
        <DropdownMenuItem
          onClick={() => changeFollowPartner(!followPartnerColor)}
          className={cn(
            "flex items-center justify-between",
            followPartnerColor ? "bg-secondary" : "",
          )}
        >
          Cores do parceiro
          {followPartnerColor ? <CheckIcon /> : null}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/app/profile">Minha Conta</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/help">Ajuda & Documentação</Link>
        </DropdownMenuItem>

        {person.admin && (
          <DropdownMenuGroup className="-mx-1 -mb-1 bg-secondary px-1 pb-1">
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Admin</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link to="/app/admin/partners">Parceiros</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/admin/partner/new">Novo Parceiro</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/admin/users">Usuários</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/admin/user/new">Novo Usuário</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/admin/clients">Clientes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/admin/clients/new">Novo Cliente</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/admin/celebrations">Datas Comemorativas</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/schedule">Programação</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
