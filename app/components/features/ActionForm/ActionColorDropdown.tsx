import Color from "color";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
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
  const [selected, setSelected] = useState(action.color);

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
      <DropdownMenuContent className="grid w-40 grid-cols-3 gap-2 p-2">
        {[
          ...new Set(
            (partners.length > 0
              ? partners.map((partner) =>
                  partner.colors.map((color) => Color(color).hex()),
                )
              : [
                  Color(action.color).lighten(0.4).hex(),
                  action.color,
                  Color(action.color).darken(0.4).hex(),
                ]
            ).flat(),
          ),
        ].map((color, index) => (
          <DropdownMenuItem
            key={index}
            className="cursor-pointer p-0 hover:opacity-50"
            onSelect={() => {
              setSelected(color);
              onSelect?.(color);
            }}
          >
            <div
              className="aspect-[4/5] w-12 rounded border border-black/5"
              style={{ backgroundColor: color }}
            ></div>
          </DropdownMenuItem>
        ))}
        <div className="col-span-3 flex w-full items-center gap-2">
          <Input
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              onSelect?.(e.target.value);
            }}
            placeholder="Hex"
            className="h-8"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
