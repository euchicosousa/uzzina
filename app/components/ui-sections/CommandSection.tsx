import { useState } from "react";
import { CalendarIcon, SettingsIcon, UserIcon, PlusIcon } from "lucide-react";
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
  PrismKbd,
  toast,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

const COMMAND_CONTAINERS = ["dialog", "popover"] as const;
type CommandContainer = (typeof COMMAND_CONTAINERS)[number];
const COMMAND_CONTAINER_LABELS: Record<CommandContainer, string> = {
  dialog: "Diálogo",
  popover: "Popover",
};

function CommandPlayground() {
  const [container, setContainer] = useState<CommandContainer>("dialog");
  const [showGroups, setShowGroups] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const renderCommandContent = (onSelectClose: () => void) => (
    <PrismCommand inputValue={query} onInputChange={setQuery}>
      <PrismCommandInput placeholder="Buscar ação ou atalho..." />
      <PrismCommandList
        renderEmptyState={() => (
          <PrismCommandEmpty>Nenhum item foi encontrado.</PrismCommandEmpty>
        )}
      >
        {showGroups ? (
          <>
            <PrismCommandGroup heading="Ações">
              <PrismCommandItem
                id="new-action"
                onAction={() => {
                  toast.success("Nova ação criada");
                  onSelectClose();
                }}
                textValue="Nova Ação"
              >
                <PlusIcon className="mr-2" />
                <span>Nova Ação</span>
                {showShortcuts && (
                  <PrismCommandShortcut>
                    <PrismKbd>⌘N</PrismKbd>
                  </PrismCommandShortcut>
                )}
              </PrismCommandItem>
              <PrismCommandItem
                id="calendar"
                onAction={() => {
                  toast.info("Navegando para Calendário");
                  onSelectClose();
                }}
                textValue="Ir para Calendário"
              >
                <CalendarIcon className="mr-2" />
                <span>Ir para Calendário</span>
                {showShortcuts && (
                  <PrismCommandShortcut>
                    <PrismKbd>⌘C</PrismKbd>
                  </PrismCommandShortcut>
                )}
              </PrismCommandItem>
            </PrismCommandGroup>
            <PrismCommandSeparator />
            <PrismCommandGroup heading="Configurações">
              <PrismCommandItem
                id="profile"
                onAction={() => {
                  toast.info("Abrir Perfil");
                  onSelectClose();
                }}
                textValue="Minha Conta"
              >
                <UserIcon className="mr-2" />
                <span>Minha Conta</span>
                {showShortcuts && (
                  <PrismCommandShortcut>
                    <PrismKbd>⌘P</PrismKbd>
                  </PrismCommandShortcut>
                )}
              </PrismCommandItem>
              <PrismCommandItem
                id="settings"
                onAction={() => {
                  toast.info("Abrir Configurações");
                  onSelectClose();
                }}
                textValue="Preferências"
              >
                <SettingsIcon className="mr-2" />
                <span>Preferências</span>
              </PrismCommandItem>
            </PrismCommandGroup>
          </>
        ) : (
          <>
            <PrismCommandItem
              id="new-action"
              onAction={() => {
                toast.success("Nova ação criada");
                onSelectClose();
              }}
              textValue="Nova Ação"
            >
              <PlusIcon className="mr-2" />
              <span>Nova Ação</span>
              {showShortcuts && (
                <PrismCommandShortcut>
                  <PrismKbd>⌘N</PrismKbd>
                </PrismCommandShortcut>
              )}
            </PrismCommandItem>
            <PrismCommandItem
              id="calendar"
              onAction={() => {
                toast.info("Navegando para Calendário");
                onSelectClose();
              }}
              textValue="Ir para Calendário"
            >
              <CalendarIcon className="mr-2" />
              <span>Ir para Calendário</span>
              {showShortcuts && (
                <PrismCommandShortcut>
                  <PrismKbd>⌘C</PrismKbd>
                </PrismCommandShortcut>
              )}
            </PrismCommandItem>
            <PrismCommandItem
              id="profile"
              onAction={() => {
                toast.info("Abrir Perfil");
                onSelectClose();
              }}
              textValue="Minha Conta"
            >
              <UserIcon className="mr-2" />
              <span>Minha Conta</span>
              {showShortcuts && (
                <PrismCommandShortcut>
                  <PrismKbd>⌘P</PrismKbd>
                </PrismCommandShortcut>
              )}
            </PrismCommandItem>
          </>
        )}
      </PrismCommandList>
    </PrismCommand>
  );

  return (
    <PropsPlayground
      caption={`container="${container}" · showGroups={${showGroups}}`}
      preview={
        container === "dialog" ? (
          <>
            <PrismButton onClick={() => setOpen(true)} variant="outline">
              Abrir comando
            </PrismButton>
            <PrismCommandDialog
              onOpenChange={setOpen}
              open={open}
              showCloseButton={showCloseButton}
            >
              {renderCommandContent(() => setOpen(false))}
            </PrismCommandDialog>
          </>
        ) : (
          <PrismPopoverTrigger>
            <PrismButton variant="outline">Abrir comando</PrismButton>
            <PrismPopover className="w-80 overflow-hidden p-0">
              {renderCommandContent(() => {})}
            </PrismPopover>
          </PrismPopoverTrigger>
        )
      }
      title="Command"
    >
      <PlaygroundRadio
        label="Onde abre"
        onChange={setContainer}
        optionLabels={COMMAND_CONTAINER_LABELS}
        options={COMMAND_CONTAINERS}
        prop="contêiner"
        value={container}
      />
      <PlaygroundBoolean
        label="Grupos"
        onChange={setShowGroups}
        prop="PrismCommandGroup"
        value={showGroups}
      />
      <PlaygroundBoolean
        label="Atalhos"
        onChange={setShowShortcuts}
        prop="PrismCommandShortcut"
        value={showShortcuts}
      />
      <PlaygroundBoolean
        isDisabled={container === "popover"}
        label="Botão fechar (X)"
        onChange={setShowCloseButton}
        prop="showCloseButton"
        value={showCloseButton}
      />
    </PropsPlayground>
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
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Command">
            <CommandPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
