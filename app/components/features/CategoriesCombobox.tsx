import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { useMatches } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Icons } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export const CategoriesCombobox = ({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: string;
  onSelect?: (category: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { categories } = useMatches()[1].loaderData as {
    categories: Category[];
  };
  let currentCategory = categories.find(
    (category) => category.slug === selectedCategory,
  )!;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="hover:bg-secondary flex items-center gap-2 p-6 text-sm outline-none">
          <Icons
            slug={currentCategory.slug}
            className="size-5"
            color={currentCategory.color}
          />

          <div>{currentCategory.title}</div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Procurar estado..." />
          <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
          <CommandList className="p-2 outline-none">
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                className={cn("flex items-center gap-2")}
                onSelect={() => {
                  onSelect?.(category.slug);
                  setOpen(false);
                }}
              >
                <Icons
                  slug={category.slug}
                  className="size-5"
                  color={category.color}
                />
                {category.title}
                <CheckIcon
                  className={cn(
                    "ml-auto size-4",
                    selectedCategory === category.slug
                      ? "visible"
                      : "invisible",
                  )}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
