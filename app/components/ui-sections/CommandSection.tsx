import { useState, useEffect } from "react";
import {
  SearchIcon,
  FilterIcon,
  HandshakeIcon,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
} from "lucide-react";
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
  PrismKbd,
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
  const [query, setQuery] = useState("");
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

  const filteredPartners = partners.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PrismPopoverTrigger>
      <PrismButton className="relative" size="icon" variant="ghost">
        {partnerFilters.length > 0 ? (
          <PrismBadge variant="info">{partnerFilters.length}</PrismBadge>
        ) : (
          <HandshakeIcon />
        )}
      </PrismButton>
      <PrismPopover className="w-56 overflow-hidden p-0">
        <PrismCommand className="p-0">
          <div className="flex items-center border-b px-3 py-2">
            <SearchIcon className="mr-2 size-3.5 shrink-0 opacity-50" />
            <input
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              placeholder="Buscar parceiro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <PrismCommandList
            renderEmptyState={() => (
              <PrismCommandEmpty>Nenhum parceiro encontrado.</PrismCommandEmpty>
            )}
          >
            <PrismCommandGroup>
              {filteredPartners.map((partner) => {
                const isSelected = partnerFilters.includes(partner.slug);
                return (
                  <PrismCommandItem
                    key={partner.slug}
                    className={isSelected ? "bg-secondary font-medium" : ""}
                    data-checked={isSelected}
                    id={partner.slug}
                    onPress={() => {
                      if (isSelected) {
                        setPartnerFilters(
                          partnerFilters.filter((s) => s !== partner.slug),
                        );
                      } else {
                        setPartnerFilters([...partnerFilters, partner.slug]);
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
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  const items = [
    {
      id: "cal",
      title: "Ver Calendário",
      group: "Ações Rápidas",
      icon: <CalendarIcon className="size-4" />,
    },
    {
      id: "user",
      title: "Perfil do Usuário",
      group: "Ações Rápidas",
      icon: <UserIcon className="size-4" />,
    },
    {
      id: "settings",
      title: "Configurações da Conta",
      group: "Sistema",
      icon: <SettingsIcon className="size-4" />,
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
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <SearchIcon className="size-4" />
          Faça sua busca...
        </span>
        <PrismKbd>⌘K</PrismKbd>
      </PrismButton>

      <PrismCommandDialog onOpenChange={setOpen} open={open}>
        <PrismCommand inputValue={query} onInputChange={setQuery}>
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
                        <PrismKbd>{item.shortcut}</PrismKbd>
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
          approved
          description="Barra de busca e menu de comandos para atalhos do teclado, navegação ou filtros."
          title="Command"
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
