import { HandshakeIcon, PlusIcon, SearchIcon } from "lucide-react";
import { UzzinaLogo } from "../logo";
import { Button } from "../ui/button";
import { UBadge } from "../uzzina/UBadge";
import { UAvatar } from "../uzzina/UAvatar";
import { PRIORITY, SIZE, STATE } from "~/lib/CONSTANTS";
import { getLateActions } from "~/lib/helpers";
import { Link, useMatches } from "react-router";
import type { AppHomeLoaderData } from "~/routes/app.home";
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
import { Theme, useTheme } from "remix-themes";
import { getThemeIcon } from "~/lib/helpers";

export function Header({
  person,
  setBaseAction,
}: {
  person: Person;
  setBaseAction: (action: any) => void;
}) {
  const { actionsChart } = useMatches()[2].loaderData as AppHomeLoaderData;

  return (
    <div className="border_after flex w-full items-center justify-between px-8">
      <div className="flex items-center gap-2 py-4">
        <Link to="/app">
          <UzzinaLogo className="h-8" />
        </Link>

        <Button variant="ghost" size="icon" className="rounded-full">
          <SearchIcon />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            setBaseAction({
              title: "",
              description: "",
              state: STATE.idea,
              priority: PRIORITY.medium,
              category: "post",
              responsibles: [person.user_id],
              topics: null,
              color: "#999",
              date: new Date(),
              instagram_date: new Date(),
              partners: [],
            })
          }
        >
          Nova Ação
          <PlusIcon />
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <HandshakeIcon />
          {actionsChart && actionsChart.length > 0 ? (
            <UBadge
              size="sm"
              value={getLateActions(actionsChart).length}
              isDynamic
              className="absolute -top-2 -right-2"
            />
          ) : null}
        </Button>
        <HeaderMenu person={person} />
      </div>
    </div>
  );
}

const HeaderMenu = ({ person }: { person: Person }) => {
  const [theme, setTheme] = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UAvatar size={SIZE.sm} fallback={person.short} image={person.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
