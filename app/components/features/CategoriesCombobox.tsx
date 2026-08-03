import { useState } from "react";
import {
  PrismCommand,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandInput,
  PrismCommandItem,
  PrismCommandList,
  PrismPopover,
  PrismPopoverTrigger,
} from "~/components/prism";
import { AREAS, CATEGORIES } from "~/lib/CONSTANTS";
import { Icons } from "~/lib/helpers";
import { ComboboxTrigger } from "./ComboboxTrigger";
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
  triggerVariant,
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
  triggerVariant?: "filter" | "form-inline" | "form-link" | "form-footer";
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
  const hasSelection =
    currentCategories.length > 0 && currentCategories[0].slug !== "all";
  const effectiveVariant =
    triggerVariant || (isMulti ? "filter" : "form-inline");
  return (
    <PrismPopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      {isMulti && effectiveVariant === "filter" ? (
        <ComboboxTrigger
          data-state={hasSelection && "on"}
          hasSelection={hasSelection}
          tabIndex={tabIndex}
          title={
            currentCategories.length === 0 ||
            currentCategories[0].slug === "all"
              ? "Escolha a categoria"
              : currentCategories.map((category) => category.title).join(" • ")
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
          variant={effectiveVariant}
        >
          <Icons
            className={
              !showText ? "size-5" : size === "sm" ? "size-4" : "size-5"
            }
            color={currentCategories[0]?.color || "#666"}
            slug={currentCategories[0]?.slug || "categories"}
          />
          {showText && (
            <div className="overflow-hidden text-ellipsis whitespace-nowrap">
              {currentCategories[0]?.title || "Selecione..."}
            </div>
          )}
        </ComboboxTrigger>
      )}
      <PrismPopover className="p-0">
        <PrismCommand>
          <PrismCommandInput placeholder="Procurar categoria..." />

          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>
                Nenhuma categoria encontrada.
              </PrismCommandEmpty>
            )}
          >
            {AREA_ORDER.map((areaSlug) => {
              const items = groupedCategories[areaSlug];
              if (!items || items.length === 0) return null;
              const areaTitle =
                areaSlug === "all"
                  ? "Filtros"
                  : areaSlug === "instagram"
                    ? "Instagram"
                    : AREAS[areaSlug as keyof typeof AREAS]?.title || "Outros";
              return (
                <PrismCommandGroup key={areaSlug} heading={areaTitle}>
                  {items.map((category) => (
                    <PrismCommandItem
                      key={category.slug}
                      data-selected={
                        category.slug === "instagram"
                          ? selectedCategories.filter(
                              (s) =>
                                s === "post" ||
                                s === "reels" ||
                                s === "carousel",
                            ).length === 3
                          : selectedCategories.includes(category.slug)
                      }
                      onAction={() => {
                        if (isMulti) {
                          let newCategories = selectedCategories;
                          if (category.slug === "all") {
                            newCategories = ["all"];
                          } else if (category.slug === "instagram") {
                            newCategories = ["post", "reels", "carousel"];
                          } else {
                            const isShiftPressed = (
                              window.event as MouseEvent | undefined
                            )?.shiftKey;
                            if (isShiftPressed) {
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
                      textValue={category.title}
                    >
                      <Icons
                        className="size-4"
                        color={category.color}
                        slug={category.slug}
                      />
                      <span>{category.title}</span>
                    </PrismCommandItem>
                  ))}
                </PrismCommandGroup>
              );
            })}
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
