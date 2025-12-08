import { HandshakeIcon, PlusIcon, SearchIcon } from "lucide-react";
import {
  Link,
  useFetchers,
  useMatches,
  useNavigate,
  useNavigation,
  useParams,
} from "react-router";
import { Theme, useTheme } from "remix-themes";
import { SIZE } from "~/lib/CONSTANTS";
import { getCleanAction, getLateActions, getThemeIcon } from "~/lib/helpers";
import type { AppHomeLoaderData } from "~/routes/app.home";
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
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  const { partners } = useMatches()[1].loaderData as { partners: Partner[] };
  const { actionsChart } = useMatches()[2].loaderData as AppHomeLoaderData;
  const navigate = useNavigate();
  const params = useParams();

  const lateActions = getLateActions(actionsChart);

  return (
    <div className="border_after flex w-full items-center justify-between px-8">
      <div className="flex items-center gap-2 py-4">
        <Link to="/app">
          <UzzinaLogo className="h-8" />
        </Link>

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
        <Button
          onClick={() =>
            setBaseAction({
              ...getCleanAction(person.user_id),
              partners: params.slug ? [params.slug] : [],
            })
          }
        >
          Nova Ação
          <PlusIcon />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <HandshakeIcon />
              {actionsChart && actionsChart.length > 0 ? (
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
  const isLoading =
    useFetchers().length > 0 || useNavigation().state !== "idle";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative outline-none">
        {isLoading && (
          <div className="border-primary absolute top-0 left-0 size-11 -translate-1.5 animate-spin rounded-full border-4 border-b-transparent"></div>
        )}

        <UAvatar size={SIZE.md} fallback={person.short} image={person.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-2">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon(theme, "size-4 mr-2")} Mudar o tema
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme(Theme.DARK)}>
                {getThemeIcon(Theme.DARK, "size-4")} Tema escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(Theme.LIGHT)}>
                {getThemeIcon(Theme.LIGHT, "size-4")} Tema claro
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
