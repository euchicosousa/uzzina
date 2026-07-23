import { useState, useEffect } from "react";
import {
  IconSearch,
  IconFilter,
  IconHeartHandshake,
  IconCalendar,
  IconUser,
  IconSettings,
} from "@tabler/icons-react";
import {
  PrismCommand,
  PrismCommandDialog,
  PrismCommandInput,
  PrismCommandList,
  PrismCommandEmpty,
  PrismCommandGroup,
  PrismCommandItem,
  PrismCommandSeparator,
  PrismCommandShortcut,
  PrismPopoverTrigger,
  PrismPopover,
  PrismButton,
  PrismToggle,
  PrismBadge,
  toast,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
function CommandPopoverDemo() {
  const [partnerFilters, setPartnerFilters] = useState<string[]>([]);
  const [isFilterMode, setIsFilterMode] = useState(false);
  const partners = [
    {
      slug: "cnvt",
      title: "CNVT Creative",
      short: "CNVT",
    },
    {
      slug: "uzzina",
      title: "Uzzina Tech",
      short: "UZZ",
    },
    {
      slug: "acme",
      title: "Acme Corp",
      short: "ACM",
    },
  ];
  return (
    <PrismPopoverTrigger>
      <PrismButton className="relative" size="icon" variant="ghost">
        {partnerFilters.length > 0 ? (
          <PrismBadge variant="info">{partnerFilters.length}</PrismBadge>
        ) : (
          <IconHeartHandshake />
        )}
      </PrismButton>
      <PrismPopover className="p-0 rounded-4xl">
        <PrismCommand className="p-0 w-72">
          <div className="flex items-center border-b px-1">
            <PrismCommandInput placeholder="Parceiro..." />
            <PrismToggle
              className="mr-2"
              isSelected={isFilterMode}
              onChange={(selected) => {
                if (!selected) {
                  setPartnerFilters([]);
                }
                setIsFilterMode(selected);
              }}
              size="sm"
            >
              <IconFilter />
            </PrismToggle>
          </div>
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum parceiro encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {partners.map((partner) => {
                const isSelected = partnerFilters.includes(partner.slug);
                return (
                  <PrismCommandItem
                    key={partner.slug}
                    className={isSelected ? "bg-secondary" : ""}
                    data-checked={isSelected}
                    id={partner.slug}
                    onPress={() => {
                      if (isFilterMode) {
                        if (isSelected) {
                          setPartnerFilters(
                            partnerFilters.filter((s) => s !== partner.slug),
                          );
                        } else {
                          setPartnerFilters([...partnerFilters, partner.slug]);
                        }
                      } else {
                        toast.info(`Navegar para ${partner.title}`);
                      }
                    }}
                    textValue={partner.title}
                  >
                    <span>{partner.title}</span>
                  </PrismCommandItem>
                );
              })}
            </PrismCommandGroup>
          </PrismCommandList>
        </PrismCommand>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
function CommandDialogDemo() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const items = [
    {
      id: "cal",
      title: "Ver Calendário",
      group: "Ações Rápidas",
      icon: <IconCalendar className="size-4" />,
    },
    {
      id: "user",
      title: "Perfil do Usuário",
      group: "Ações Rápidas",
      icon: <IconUser className="size-4" />,
    },
    {
      id: "settings",
      title: "Configurações da Conta",
      group: "Sistema",
      icon: <IconSettings className="size-4" />,
      shortcut: "⌘S",
    },
  ];
  const filtered =
    query.trim() === ""
      ? items
      : items.filter((i) =>
          i.title.toLowerCase().includes(query.toLowerCase()),
        );
  const actions = filtered.filter((i) => i.group === "Ações Rápidas");
  const system = filtered.filter((i) => i.group === "Sistema");
  return (
    <div className="flex flex-col gap-3">
      <PrismButton
        className="w-72 justify-between border bg-input/50"
        onClick={() => setOpen(true)}
        variant="ghost"
      >
        <span className="flex items-center gap-2 text-muted-foreground text-sm">
          <IconSearch className="size-4" />
          Faça sua busca...
        </span>
        <kbd className="px-2 py-0.5 text-xs bg-muted rounded border text-muted-foreground">
          ⌘K
        </kbd>
      </PrismButton>

      <PrismCommandDialog onOpenChange={setOpen} open={open}>
        <PrismCommand
          className="p-1"
          inputValue={query}
          onInputChange={setQuery}
        >
          <PrismCommandInput placeholder="Faça sua busca..." />
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum item foi encontrado.</PrismCommandEmpty>
            )}
          >
            {actions.length > 0 && (
              <PrismCommandGroup heading="Ações Rápidas">
                {actions.map((item) => (
                  <PrismCommandItem
                    key={item.id}
                    id={item.id}
                    onPress={() => {
                      toast.success(`Executou: ${item.title}`);
                      setOpen(false);
                    }}
                    textValue={item.title}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </PrismCommandItem>
                ))}
              </PrismCommandGroup>
            )}

            {actions.length > 0 && system.length > 0 && (
              <PrismCommandSeparator />
            )}

            {system.length > 0 && (
              <PrismCommandGroup heading="Sistema">
                {system.map((item) => (
                  <PrismCommandItem
                    key={item.id}
                    id={item.id}
                    onPress={() => {
                      toast.success(`Executou: ${item.title}`);
                      setOpen(false);
                    }}
                    textValue={item.title}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                    {item.shortcut && (
                      <PrismCommandShortcut>
                        {item.shortcut}
                      </PrismCommandShortcut>
                    )}
                  </PrismCommandItem>
                ))}
              </PrismCommandGroup>
            )}
          </PrismCommandList>
        </PrismCommand>
      </PrismCommandDialog>
    </div>
  );
}
export function CommandSection() {
  return (
    <div id="prism-command">
      <GallerySection>
        <GallerySectionHeader
          description="Barra de busca e menu de comandos para atalhos do teclado, navegação ou filtros."
          title="PrismCommand"
        />
        <GallerySectionContent>
          <GalleryItem label="Command em Popover (Filtro Inline / AppBar)">
            <CommandPopoverDemo />
          </GalleryItem>
          <GalleryItem label="Command em Dialog (Busca Global ⌘K)">
            <CommandDialogDemo />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
