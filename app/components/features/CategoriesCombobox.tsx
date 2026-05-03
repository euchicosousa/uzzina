import { Fragment, useEffect, useRef, useState } from "react";
import { CheckIcon } from "lucide-react";
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
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { AREAS, CATEGORIES } from "~/lib/CONSTANTS";

export function CategoriesCombobox({
  selectedCategories,
  onSelect,
  isMulti,
  showInstagramGroup,
  className,
  tabIndex,
  showText = true,
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
  showInstagramGroup?: boolean;
  className?: string;
  tabIndex?: number;
  showText?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const CATEGORIES_LIST = Object.values(CATEGORIES);

  let categoriesList = showInstagramGroup
    ? [
        {
          color: "#666",
          slug: "instagram",
          title: "Feed do Instagram",
        },
        ...CATEGORIES_LIST,
      ]
    : CATEGORIES_LIST;

  categoriesList = isMulti
    ? [
        {
          color: "#666",
          slug: "all",
          title: "Todas as categorias",
        },
        ...categoriesList,
      ]
    : categoriesList;

  let currentCategories = categoriesList.filter(
    (category) =>
      selectedCategories.find((slug) => slug === category.slug) !== undefined,
  );

  // Agrupamento por área
  const groupedCategories = categoriesList.reduce(
    (acc, category) => {
      let area = (category as any).area || "other";
      if (category.slug === "all") area = "all";

      // Move os itens de postagem para o grupo do Instagram
      if (
        category.slug === "instagram" ||
        ["post", "reels", "carousel", "stories"].includes(category.slug)
      ) {
        area = "instagram";
      }

      if (!acc[area]) acc[area] = [];
      acc[area].push(category);
      return acc;
    },
    {} as Record<string, typeof categoriesList>,
  );

  const AREA_ORDER = ["all", "instagram", "creative", "account", "adm"];

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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {isMulti ? (
          <Button
            tabIndex={tabIndex}
            variant={
              currentCategories.filter((c) => c.slug !== "all").length === 0
                ? "ghost"
                : "secondary"
            }
            className="flex gap-px"
            title={
              currentCategories[0].slug === "all"
                ? "Escolha a categoria"
                : currentCategories
                    .map((category) => category.title)
                    .join(" • ")
            }
          >
            {currentCategories[0].slug === "all" ? (
              <Icons color="#666" slug="categories" />
            ) : (
              currentCategories.map((category) => (
                <Icons
                  key={category.slug}
                  slug={category.slug}
                  color={category.color}
                />
              ))
            )}
          </Button>
        ) : (
          <button
            tabIndex={tabIndex}
            className={cn(
              "hover:bg-secondary focus:bg-secondary/50 flex items-center gap-2 overflow-hidden p-6 text-sm outline-none",
              className,
            )}
          >
            <Icons
              slug={currentCategories[0].slug}
              className="size-5"
              color={currentCategories[0].color}
            />
            {showText && (
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {currentCategories[0].title}
              </div>
            )}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Procurar estado..." />
          <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
          <CommandList className="p-1 outline-none">
            {AREA_ORDER.map((areaSlug, index) => {
              const items = groupedCategories[areaSlug];
              if (!items || items.length === 0) return null;

              const areaTitle =
                areaSlug === "all"
                  ? "Filtros"
                  : areaSlug === "instagram"
                    ? "Instagram"
                    : AREAS[areaSlug as keyof typeof AREAS]?.title || "Outros";

              return (
                <Fragment key={areaSlug}>
                  <CommandGroup heading={areaTitle}>
                    {items.map((category) => (
                      <CommandItem
                        key={category.slug}
                        className={cn("flex items-center gap-2")}
                        onSelect={() => {
                          if (isMulti) {
                            let newCategories = selectedCategories;

                            if (category.slug === "all") {
                              newCategories = ["all"];
                            } else if (category.slug === "instagram") {
                              newCategories = ["post", "reels", "carousel"];
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
                                  newCategories = [
                                    ...newCategories,
                                    category.slug,
                                  ];
                                }
                              }

                              newCategories =
                                newCategories.length === 0
                                  ? ["all"]
                                  : newCategories;
                            }

                            onSelect?.({
                              categories: newCategories,
                              category: "",
                            });
                          } else {
                            onSelect?.({
                              category: category.slug,
                              categories: [],
                            });
                          }
                          setIsOpen(false);
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
                            category.slug === "instagram"
                              ? selectedCategories.filter(
                                  (s) =>
                                    s === "post" ||
                                    s === "reels" ||
                                    s === "carousel",
                                ).length === 3
                                ? "visible"
                                : "invisible"
                              : selectedCategories.includes(category.slug)
                                ? "visible"
                                : "invisible",
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {index < AREA_ORDER.length - 1 &&
                    groupedCategories[AREA_ORDER[index + 1]]?.length > 0 && (
                      <CommandSeparator className="my-1" />
                    )}
                </Fragment>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
