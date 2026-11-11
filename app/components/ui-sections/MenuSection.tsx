import { useState } from "react";
import type { Key } from "react-aria-components";
import {
  PencilIcon,
  CopyIcon,
  ArchiveIcon,
  Trash2Icon,
  FolderIcon,
} from "lucide-react";
import {
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismMenuLabel,
  PrismMenuSeparator,
  PrismMenuGroup,
  PrismMenuSub,
  PrismMenuSubContent,
  PrismMenuSubTrigger,
  PrismMenuShortcut,
  PrismButton,
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
  PlaygroundSelect,
  PlaygroundRadio,
  PlaygroundBoolean,
} from "./PropsPlayground";

const SELECTION_MODES = ["none", "single", "multiple"] as const;
type MenuSelectionMode = (typeof SELECTION_MODES)[number];
const SELECTION_MODE_LABELS: Record<MenuSelectionMode, string> = {
  none: "Nenhuma",
  single: "Única",
  multiple: "Múltipla",
};

const MENU_PLACEMENTS = [
  "bottom start",
  "bottom end",
  "top start",
  "right top",
] as const;
type MenuPlacement = (typeof MENU_PLACEMENTS)[number];

function MenuPlayground() {
  const [selectionMode, setSelectionMode] = useState<MenuSelectionMode>("none");
  const [placement, setPlacement] = useState<MenuPlacement>("bottom start");
  const [showIcons, setShowIcons] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showGroups, setShowGroups] = useState(true);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [hasDisabled, setHasDisabled] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const disabledKeys = hasDisabled ? ["archive"] : [];

  return (
    <PropsPlayground
      caption={`selectionMode="${selectionMode}" · placement="${placement}"`}
      preview={
        <PrismMenu>
          <PrismButton variant="outline">Abrir menu</PrismButton>
          <PrismMenuContent
            className="w-56"
            disabledKeys={disabledKeys}
            onSelectionChange={(keys) => {
              setSelectedKeys(Array.from(keys as Set<Key>, String));
            }}
            placement={placement}
            selectedKeys={selectedKeys}
            selectionMode={selectionMode}
          >
            {showGroups ? (
              <PrismMenuGroup>
                <PrismMenuLabel>Ações da Ação</PrismMenuLabel>
                <PrismMenuItem
                  id="edit"
                  onAction={() => toast.info("Editar ação")}
                >
                  {showIcons && <PencilIcon className="mr-2" />}
                  <span>Editar</span>
                  {showShortcuts && <PrismMenuShortcut>⌘E</PrismMenuShortcut>}
                </PrismMenuItem>
                <PrismMenuItem
                  id="duplicate"
                  onAction={() => toast.info("Duplicar ação")}
                >
                  {showIcons && <CopyIcon className="mr-2" />}
                  <span>Duplicar</span>
                  {showShortcuts && <PrismMenuShortcut>⌘D</PrismMenuShortcut>}
                </PrismMenuItem>
              </PrismMenuGroup>
            ) : (
              <>
                <PrismMenuItem
                  id="edit"
                  onAction={() => toast.info("Editar ação")}
                >
                  {showIcons && <PencilIcon className="mr-2" />}
                  <span>Editar</span>
                  {showShortcuts && <PrismMenuShortcut>⌘E</PrismMenuShortcut>}
                </PrismMenuItem>
                <PrismMenuItem
                  id="duplicate"
                  onAction={() => toast.info("Duplicar ação")}
                >
                  {showIcons && <CopyIcon className="mr-2" />}
                  <span>Duplicar</span>
                  {showShortcuts && <PrismMenuShortcut>⌘D</PrismMenuShortcut>}
                </PrismMenuItem>
              </>
            )}

            {showSubmenu && (
              <PrismMenuSub>
                <PrismMenuSubTrigger>
                  {showIcons && <FolderIcon className="mr-2" />}
                  <span>Mover para</span>
                </PrismMenuSubTrigger>
                <PrismMenuSubContent className="w-48">
                  <PrismMenuItem
                    id="folder-sprint"
                    onAction={() => toast.info("Movido para Sprint")}
                  >
                    Próxima Sprint
                  </PrismMenuItem>
                  <PrismMenuItem
                    id="folder-backlog"
                    onAction={() => toast.info("Movido para Backlog")}
                  >
                    Backlog
                  </PrismMenuItem>
                </PrismMenuSubContent>
              </PrismMenuSub>
            )}

            {showGroups && <PrismMenuSeparator />}

            <PrismMenuItem
              id="archive"
              onAction={() => toast.info("Arquivar ação")}
            >
              {showIcons && <ArchiveIcon className="mr-2" />}
              <span>Arquivar</span>
            </PrismMenuItem>
            <PrismMenuItem
              className="text-error focus:text-error"
              id="delete"
              onAction={() => toast.warning("Excluir ação")}
            >
              {showIcons && <Trash2Icon className="mr-2" />}
              <span>Excluir</span>
            </PrismMenuItem>
          </PrismMenuContent>
        </PrismMenu>
      }
      title="Menu"
    >
      <PlaygroundRadio
        label="Seleção"
        onChange={setSelectionMode}
        optionLabels={SELECTION_MODE_LABELS}
        options={SELECTION_MODES}
        prop="selectionMode"
        value={selectionMode}
      />
      <PlaygroundSelect
        label="Posição"
        onChange={setPlacement}
        options={MENU_PLACEMENTS}
        prop="placement"
        value={placement}
      />
      <PlaygroundBoolean
        label="Ícones"
        onChange={setShowIcons}
        prop="svg"
        value={showIcons}
      />
      <PlaygroundBoolean
        label="Atalhos"
        onChange={setShowShortcuts}
        prop="PrismMenuShortcut"
        value={showShortcuts}
      />
      <PlaygroundBoolean
        label="Grupos e rótulos"
        onChange={setShowGroups}
        prop="PrismMenuGroup"
        value={showGroups}
      />
      <PlaygroundBoolean
        label="Submenu"
        onChange={setShowSubmenu}
        prop="PrismMenuSub"
        value={showSubmenu}
      />
      <PlaygroundBoolean
        label="Item desabilitado"
        onChange={setHasDisabled}
        prop="disabledKeys"
        value={hasDisabled}
      />
    </PropsPlayground>
  );
}

export function MenuSection() {
  return (
    <div id="prism-menu">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Menu suspenso avançado contendo agrupamentos, atalhos, itens de seleção múltipla (checkbox), itens destrutivos e submenus aninhados."
          title="Dropdown Menu"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Dropdown Menu">
            <MenuPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
