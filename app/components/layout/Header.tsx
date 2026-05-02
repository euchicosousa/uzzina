import {
  CheckIcon,
  CopyCheckIcon,
  HeartHandshakeIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import {
  Link,
  useFetchers,
  useMatches,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { Theme, useTheme } from "remix-themes";
import { BulkActionMenu } from "~/components/features/BulkActionMenu";
import { UToggleInput } from "~/components/uzzina/UToggle";
import { useAppTheme } from "~/hooks/useAppTheme";
import { useMultiSelection } from "~/hooks/useMultiSelection";
import { PALLETE, SIZE } from "~/lib/CONSTANTS";
import { getCleanAction, getThemeIcon } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { UzzinaLogo } from "../logo";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { UAvatar } from "../uzzina/UAvatar";
import { UBadge } from "../uzzina/UBadge";

export function Header({
  person,
  setBaseAction,
  setOpenCmdK,
}: {
  person: Person;
  setBaseAction: (action: any) => void;
  setOpenCmdK: (open: boolean) => void;
}) {
  const { partners, lateActions } = useMatches()[1].loaderData as {
    partners: Partner[];
    lateActions: Action[];
  };
  const navigate = useNavigate();
  const params = useParams();

  const responsibles =
    params.slug && params.slug !== "new"
      ? partners.filter((p) => p.slug === params.slug)[0].users_ids
      : [person.user_id];

  const { isSelectionMode, toggleSelectionMode, selectedIds } =
    useMultiSelection();

  return (
    <div className="border_after flex w-full items-center justify-between px-2 lg:px-8">
      <div className="flex items-center gap-2 py-4">
        {/* Logo */}
        <Link to="/app">
          <UzzinaLogo className="hidden h-8 sm:block" />
          <UzzinaLogo className="h-8 sm:hidden" model="logo" />
        </Link>

        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setOpenCmdK(true)}
        >
          <SearchIcon />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <BulkActionMenu />

        <UToggleInput
          id="toggle-multi-selection"
          checked={isSelectionMode}
          onCheckedChange={() => toggleSelectionMode()}
          className="h-10 px-4 py-2"
        >
          <CopyCheckIcon className="size-4" />
        </UToggleInput>

        <Button
          onClick={() =>
            setBaseAction({
              ...getCleanAction({
                user_id: person.user_id,
                date: undefined,
                partners: params.slug ? [params.slug] : [],
              }),
              responsibles,
            })
          }
          className="squircle rounded-2xl"
        >
          <span className="hidden sm:block">Nova Ação</span>
          <PlusIcon />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <HeartHandshakeIcon />
              {lateActions && lateActions.length > 0 ? (
                <UBadge
                  size="sm"
                  value={lateActions.length}
                  isDynamic
                  className="absolute -top-2 -right-2"
                />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="mx-2 p-0">
            <Command>
              <CommandInput placeholder="Procurar parceiro..." />
              <CommandList className="p-2 outline-none">
                <CommandEmpty>Nenumn parceiro encontrado.</CommandEmpty>
                {partners.map((partner) => {
                  const partnerLateActions = lateActions.filter((action) =>
                    action.partners.includes(partner.slug),
                  );
                  return (
                    <CommandItem
                      key={partner.id}
                      className="flex items-center justify-between gap-2"
                      onSelect={() => {
                        navigate(`/app/partner/${partner.slug}`);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <UAvatar
                          size={SIZE.sm}
                          fallback={partner.short}
                          image={partner.image}
                          backgroundColor={partner.colors[0]}
                          color={partner.colors[1]}
                        />
                        <span>{partner.title}</span>
                      </div>
                      {partnerLateActions.length > 0 ? (
                        <UBadge
                          size="sm"
                          value={partnerLateActions.length}
                          isDynamic
                        />
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandList>
            </Command>
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
    resetPrimaryColor,
    followPartnerColor,
    setFollowPartnerColor,
  } = useAppTheme();
  const isLoading =
    useFetchers().length > 0 || useNavigation().state !== "idle";

  return (
    <DropdownMenu>
      {/* Perfil */}
      <DropdownMenuTrigger className="relative outline-none">
        {isLoading && (
          <div className="border-primary absolute top-0 left-0 size-11 -translate-1.5 animate-spin rounded-full border-4 border-b-transparent"></div>
        )}
        <UAvatar size={SIZE.md} fallback={person.short} image={person.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-2">
        {theme === Theme.DARK ? (
          <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
            {getThemeIcon(Theme.LIGHT, "size-4")} Tema claro
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
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
                  setPrimaryColorIndex(i);
                }}
                key={i}
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
          onClick={() => setFollowPartnerColor(!followPartnerColor)}
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
          <Link to="/programacao">Programação</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
