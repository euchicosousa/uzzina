import Color from "color";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { cn, getGridCols, isHexColorValid } from "~/lib/utils";
import type { Action } from "~/models/actions.server";

export function ActionColorDropdown({
  action,
  partners,
  onSelect,
  tabIndex,
}: {
  action: Action;
  partners: Partner[];
  onSelect?: (color: string) => void;
  tabIndex?: number;
}) {
  const normalizedActionColor = useMemo(() => {
    return isHexColorValid(action.color) ? Color(action.color).hex() : "";
  }, [action.color]);

  const [selected, setSelected] = useState(normalizedActionColor);

  useEffect(() => {
    setSelected(normalizedActionColor);
  }, [normalizedActionColor]);

  const colors = useMemo(() => {
    let color = isHexColorValid(action.color) ? action.color : "#666";
    return [
      ...new Set(
        (partners.length > 0
          ? partners.map((partner) =>
              partner.colors.map((color) => Color(color).hex()),
            )
          : [
              Color(color).lighten(0.4).hex(),
              color,
              Color(color).darken(0.4).hex(),
            ]
        ).flat(),
      ),
    ];
  }, [partners, action.color]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          tabIndex={tabIndex}
          className="hover:bg-secondary focus:bg-secondary/50 flex items-center gap-2 p-6 text-sm outline-none"
        >
          <div
            className="size-5 rounded-full border border-black/5"
            style={{ backgroundColor: action.color }}
          ></div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("grid w-40 gap-2 p-2", getGridCols(colors.length))}
      >
        {colors.map((color, index) => (
          <DropdownMenuItem
            key={index}
            className={cn(
              "cursor-pointer p-0.5 transition-opacity hover:opacity-50",
              (selected?.toLowerCase() === color.toLowerCase() ||
                (!selected && index === 0)) &&
                "ring-primary ring-2 ring-offset-1 rounded-md",
            )}
            onSelect={() => {
              setSelected(color);
              onSelect?.(color);
            }}
          >
            <div
              className="aspect-[3/4] w-12 rounded border border-black/5"
              style={{ backgroundColor: color }}
            ></div>
          </DropdownMenuItem>
        ))}
        <div className="col-span-full flex w-full shrink-0 items-center gap-2">
          <Input
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              if (isHexColorValid(e.target.value)) {
                onSelect?.(e.target.value);
              }
            }}
            placeholder="Hex"
            className="h-8"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
