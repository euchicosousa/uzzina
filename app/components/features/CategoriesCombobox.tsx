import { CheckIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
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
  CommandSeparator,
} from "../ui/command";

export const CategoriesCombobox = ({
  selectedCategories,
  onSelect,
  isMulti,
  className,
}: {
  selectedCategories: string[];
  onSelect?: ({
    category,
    categories,
  }: {
    category: string;
    categories: string[];
  }) => void;
  isMulti?: boolean;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  let { categories } = useMatches()[1].loaderData as {
    categories: Category[];
  };

  categories = isMulti
    ? [
        {
          color: "#333",
          id: "all",
          slug: "all",
          title: "Todos as categorias",
        } as Category,
        ...categories,
      ]
    : categories;

  let currentCategories = categories.filter(
    (category) =>
      selectedCategories.find((slug) => slug === category.slug) !== undefined,
  );

  const isShiftPressedRef = useRef(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Shift") isShiftPressedRef.current = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isMulti ? (
          <Button variant={"ghost"} className="flex gap-px">
            {currentCategories[0].slug === "all" ? (
              <Icons color="#333" />
            ) : (
              currentCategories.map((category) => (
                <Icons
                  key={category.id}
                  slug={category.slug}
                  color={category.color}
                />
              ))
            )}
          </Button>
        ) : (
          <button
            className={cn(
              "hover:bg-secondary flex items-center gap-2 p-6 text-sm outline-none",
              className,
            )}
          >
            <Icons
              slug={currentCategories[0].slug}
              className="size-5"
              color={currentCategories[0].color}
            />

            <div>{currentCategories[0].title}</div>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Procurar estado..." />
          <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
          <CommandList className="p-2 outline-none">
            {categories.map((category) => (
              <Fragment key={category.id}>
                <CommandItem
                  className={cn("flex items-center gap-2")}
                  onSelect={() => {
                    if (isMulti) {
                      let newCategories = selectedCategories;

                      if (category.slug === "all") {
                        newCategories = ["all"];
                      } else {
                        if (isShiftPressedRef.current) {
                          newCategories = [category.slug];
                        } else {
                          newCategories = selectedCategories.filter(
                            (slug) => slug !== "all",
                          );

                          if (newCategories.includes(category.slug)) {
                            newCategories = newCategories.filter(
                              (slug) => slug !== category.slug,
                            );
                          } else {
                            newCategories = [...newCategories, category.slug];
                          }
                        }

                        newCategories =
                          newCategories.length === 0 ? ["all"] : newCategories;
                      }

                      onSelect?.({
                        categories: newCategories,
                        category: "",
                      });
                    } else {
                      onSelect?.({ category: category.slug, categories: [] });
                    }
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
                      selectedCategories.includes(category.slug)
                        ? "visible"
                        : "invisible",
                    )}
                  />
                </CommandItem>
                {category.slug === "all" && (
                  <CommandSeparator className="my-1" />
                )}
              </Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
