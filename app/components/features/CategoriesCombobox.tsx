import { CheckIcon } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { AREAS, CATEGORIES } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { ComboboxTrigger } from "./ComboboxTrigger";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
const AREA_ORDER = ["all", "instagram", "creative", "account", "adm"];
export function CategoriesCombobox({
  selectedCategories,
  onSelect,
  isMulti,
  showInstagramGroup,
  className,
  tabIndex,
  showText = true,
  size = "lg",
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
  size?: "sm" | "lg";
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
  const currentCategories = categoriesList.filter(
    (category) =>
      selectedCategories.find((slug) => slug === category.slug) !== undefined,
  );

  // Agrupamento por área
  const groupedCategories = categoriesList.reduce(
    (acc, category) => {
      let area =
        (
          category as {
            area?: string;
          }
        ).area || "other";
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
  const hasSelection =
    currentCategories.length > 0 && currentCategories[0].slug !== "all";
  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        {isMulti ? (
          <ComboboxTrigger
            data-state={hasSelection && "on"}
            hasSelection={hasSelection}
            tabIndex={tabIndex}
            title={
              currentCategories.length === 0 ||
              currentCategories[0].slug === "all"
                ? "Escolha a categoria"
                : currentCategories
                    .map((category) => category.title)
                    .join(" • ")
            }
            variant="filter"
          >
            {currentCategories.length === 0 ||
            currentCategories[0].slug === "all" ? (
              <Icons className="size-4" color="#666" slug="categories" />
            ) : (
              currentCategories.map((category) => (
                <Icons
                  key={category.slug}
                  className="size-4"
                  color={category.color}
                  slug={category.slug}
                />
              ))
            )}
          </ComboboxTrigger>
        ) : (
          <ComboboxTrigger
            className={className}
            size={size}
            tabIndex={tabIndex}
            variant="form-inline"
          >
            <Icons
              className={!showText ? "size-4" : size === "sm" ? "size-4" : "size-5"}
              color={currentCategories[0].color}
              slug={currentCategories[0].slug}
            />
            {showText && (
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {currentCategories[0].title}
              </div>
            )}
          </ComboboxTrigger>
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
                          className="size-5"
                          color={category.color}
                          slug={category.slug}
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
