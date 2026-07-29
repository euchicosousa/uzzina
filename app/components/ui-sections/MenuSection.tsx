import { useState } from "react";
import type { Selection } from "react-aria-components";
import {
  UserIcon,
  SettingsIcon,
  KeyboardIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from "lucide-react";
import {
  PrismMenu,
  PrismMenuContent,
  PrismMenuItem,
  PrismMenuLabel,
  PrismMenuSeparator,
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

export function MenuSection() {
  const [notificationKeys, setNotificationKeys] = useState<Selection>(
    new Set(["notifications"]),
  );
  const [themeKeys, setThemeKeys] = useState<Selection>(new Set(["system"]));

  return (
    <div id="prism-menu">
      <GallerySection>
        <GallerySectionHeader
          description="Menu suspenso avançado contendo agrupamentos, atalhos, itens de seleção múltipla (checkbox), itens destrutivos e submenus aninhados."
          title="PrismMenu"
        />
        <GallerySectionContent>
          <GalleryItem label="Menu de Ações Completo">
            <div className="flex gap-4 items-center">
              <PrismMenu>
                <PrismButton variant="default">
                  Abrir Menu Avançado
                </PrismButton>
                <PrismMenuContent
                  className="w-64"
                  placement="bottom start"
                >
                  <PrismMenuLabel>Minha Conta</PrismMenuLabel>
                  <PrismMenuItem onAction={() => toast.info("Navegar para Perfil")}>
                    <UserIcon className="size-4 mr-2 text-muted-foreground" />
                    <span>Meu Perfil</span>
                    <PrismMenuShortcut>⌘P</PrismMenuShortcut>
                  </PrismMenuItem>
                  <PrismMenuItem
                    onAction={() => toast.info("Navegar para Configurações")}
                  >
                    <SettingsIcon className="size-4 mr-2 text-muted-foreground" />
                    <span>Configurações</span>
                    <PrismMenuShortcut>⌘S</PrismMenuShortcut>
                  </PrismMenuItem>

                  <PrismMenuSeparator />

                  <PrismMenuSub>
                    <PrismMenuSubTrigger>
                      <KeyboardIcon className="size-4 mr-2 text-muted-foreground" />
                      <span>Preferências</span>
                    </PrismMenuSubTrigger>
                    <PrismMenuSubContent className="w-48">
                      <PrismMenuItem
                        onAction={() => toast.info("Tema Escuro selecionado")}
                      >
                        Tema Escuro
                      </PrismMenuItem>
                      <PrismMenuItem
                        onAction={() => toast.info("Tema Claro selecionado")}
                      >
                        Tema Claro
                      </PrismMenuItem>
                    </PrismMenuSubContent>
                  </PrismMenuSub>

                  <PrismMenuSeparator />

                  <PrismMenuItem
                    className="text-destructive"
                    onAction={() => toast.warning("Saindo da conta...")}
                    variant="destructive"
                  >
                    <LogOutIcon className="size-4 mr-2" />
                    <span>Sair da Conta</span>
                    <PrismMenuShortcut>⇧⌘Q</PrismMenuShortcut>
                  </PrismMenuItem>
                </PrismMenuContent>
              </PrismMenu>
            </div>
          </GalleryItem>

          <GalleryItem label="Menu com Checkbox (Seleção Múltipla)">
            <div className="flex gap-4 items-center">
              <PrismMenu>
                <PrismButton variant="secondary">
                  Opções de Notificação
                </PrismButton>
                <PrismMenuContent
                  className="w-56"
                  onSelectionChange={setNotificationKeys}
                  placement="bottom start"
                  selectedKeys={notificationKeys}
                  selectionMode="multiple"
                >
                  <PrismMenuLabel>Notificações</PrismMenuLabel>
                  <PrismMenuItem id="notifications">
                    Ativar Notificações
                  </PrismMenuItem>
                  <PrismMenuItem id="sounds">
                    Efeitos Sonoros
                  </PrismMenuItem>
                </PrismMenuContent>
              </PrismMenu>
            </div>
          </GalleryItem>

          <GalleryItem label="Menu com Radio (Seleção Única)">
            <div className="flex gap-4 items-center">
              <PrismMenu>
                <PrismButton
                  aria-label="Seletor de Tema"
                  className="rounded-full"
                  size="icon"
                  variant="ghost"
                >
                  {themeKeys !== "all" &&
                    themeKeys.has("light") && (
                      <SunIcon className="size-5" />
                    )}
                  {themeKeys !== "all" && themeKeys.has("dark") && (
                    <MoonIcon className="size-5" />
                  )}
                  {themeKeys !== "all" &&
                    themeKeys.has("system") && (
                      <MonitorIcon className="size-5" />
                    )}
                </PrismButton>
                <PrismMenuContent
                  onSelectionChange={setThemeKeys}
                  placement="bottom start"
                  selectedKeys={themeKeys}
                  selectionMode="single"
                >
                  <PrismMenuLabel>Tema do Sistema</PrismMenuLabel>
                  <PrismMenuItem id="light">
                    <SunIcon className="size-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">Claro</span>
                  </PrismMenuItem>
                  <PrismMenuItem id="dark">
                    <MoonIcon className="size-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">Escuro</span>
                  </PrismMenuItem>
                  <PrismMenuItem id="system">
                    <MonitorIcon className="size-4 mr-2 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      Padrão do Sistema
                    </span>
                  </PrismMenuItem>
                </PrismMenuContent>
              </PrismMenu>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
