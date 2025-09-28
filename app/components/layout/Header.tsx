import { HandshakeIcon, PlusIcon, SearchIcon } from "lucide-react";
import { UzzinaLogo } from "../logo";
import { Button } from "../ui/button";
import { UBadge } from "../uzzina/UBadge";
import { UAvatar } from "../uzzina/UAvatar";
import { SIZES } from "~/lib/CONSTANTS";

export function Header({ person }: { person: Person }) {
  return (
    <div className="border_after flex items-center p-4 justify-between">
      <div className="flex gap-2 items-center">
        <UzzinaLogo className="h-8" />
        <UBadge size="sm" value={17} isDynamic />
        <Button variant="ghost" size="icon" className="rounded-full">
          <SearchIcon />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <PlusIcon />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <HandshakeIcon />
        </Button>
        <UAvatar size={SIZES.sm} fallback={person.short} image={person.image} />
      </div>
    </div>
  );
}
