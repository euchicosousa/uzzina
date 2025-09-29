import { HandshakeIcon, PlusIcon, SearchIcon } from "lucide-react";
import { UzzinaLogo } from "../logo";
import { Button } from "../ui/button";
import { UBadge } from "../uzzina/UBadge";
import { UAvatar } from "../uzzina/UAvatar";
import { SIZE } from "~/lib/CONSTANTS";
import { getLateActions } from "~/lib/helpers";
import { useMatches } from "react-router";
import type { AppHomeLoaderData } from "~/routes/app.home";

export function Header({ person }: { person: Person }) {
  const { actions } = useMatches()[2].loaderData as AppHomeLoaderData;
  return (
    <div className="border_after flex w-full items-center justify-between px-8">
      <div className="flex items-center gap-2 py-4">
        <UzzinaLogo className="h-8" />

        <Button variant="ghost" size="icon" className="rounded-full">
          <SearchIcon />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <PlusIcon />
        </Button>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <HandshakeIcon />

          <UBadge
            size="sm"
            value={getLateActions(actions).length}
            isDynamic
            className="absolute -top-2 -right-2"
          />
        </Button>
        <UAvatar size={SIZE.sm} fallback={person.short} image={person.image} />
      </div>
    </div>
  );
}
