import { createFileRoute } from "@tanstack/react-router";
import {
  PrismButton,
  PrismInput,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
  PrismPopover,
  PrismPopoverContent,
} from "~/components/prism";
import { useState, useEffect } from "react";
import {
  IconSend,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconPalette,
  IconPaletteFilled,
  IconCategory,
  IconCategoryFilled,
  IconCheckFilled,
} from "@tabler/icons-react";
import cn from "cnfast";
export const Route = createFileRoute("/ui")({
  component: UIPage,
});
function UIPage() {
  const [inputValue, setInputValue] = useState("");
  const [activeSection, setActiveSection] = useState<"tokens" | "components">(
    "tokens",
  );
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const handleSectionChange = (section: "tokens" | "components") => {
    setActiveSection(section);
    setActiveAnchor("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Monitora a rolagem para destacar dinamicamente o link âncora ativo
  useEffect(() => {
    const targets =
      activeSection === "tokens"
        ? ["colors", "spacing"]
        : ["prism-button", "prism-input", "prism-alert", "prism-popover"];
    setActiveAnchor(targets[0]);
    const handleScroll = () => {
      // Se estiver muito próximo do topo da página, ativa o primeiro item de forma garantida
      if (window.scrollY < 80) {
        setActiveAnchor(targets[0]);
        return;
      }
      let currentActive = targets[0];
      for (const id of targets) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Se o topo da seção passou ou está perto da linha de cabeçalho
          if (rect.top <= 120) {
            currentActive = id;
          }
        }
      }
      setActiveAnchor(currentActive);
    };
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    // Executa uma vez para sincronizar o estado
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);
  return (
    <div className="min-h-screen">
      {/* Grid Principal com Sidebar Stick */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] items-start">
        {/* Sidebar Sticky de Navegação */}
        <aside className="lg:sticky flex top-0 flex-col gap-6 lg:border-r lg:p-4 h-auto lg:min-h-screen">
          <div className="flex flex-col gap-2 p-4 pb-0">
            <h1 className="text-5xl font-bold tracking-[-4px]">Prism</h1>
            <p className="text-sm text-muted-foreground">
              Design System proprietário do Uzzina (React Aria + OKLCH).
            </p>
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 border-b lg:border-b-0 p-4 pt-0 lg:p-0 overflow-x-auto lg:overflow-x-visible">
            <SidebarTabButton
              activeIcon={<IconPaletteFilled className="size-5 opacity-60" />}
              inactiveIcon={<IconPalette className="size-5 opacity-60" />}
              isActive={activeSection === "tokens"}
              label="Tokens de Design"
              onClick={() => handleSectionChange("tokens")}
            />
            {activeSection === "tokens" && (
              <div className="flex flex-col text-sm ml-4">
                <SidebarAnchorLink
                  active={activeAnchor === "colors"}
                  label="Cores Semânticas"
                  targetId="colors"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "spacing"}
                  label="Espaçamento"
                  targetId="spacing"
                />
              </div>
            )}

            <SidebarTabButton
              activeIcon={<IconCategoryFilled className="size-5 opacity-60" />}
              inactiveIcon={<IconCategory className="size-5 opacity-60" />}
              isActive={activeSection === "components"}
              label="Componentes de UI"
              onClick={() => handleSectionChange("components")}
            />
            {activeSection === "components" && (
              <div className="flex flex-col text-sm ml-4">
                <SidebarAnchorLink
                  active={activeAnchor === "prism-button"}
                  label="PrismButton"
                  targetId="prism-button"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-input"}
                  label="PrismInput"
                  targetId="prism-input"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-alert"}
                  label="PrismAlert"
                  targetId="prism-alert"
                />
                <SidebarAnchorLink
                  active={activeAnchor === "prism-popover"}
                  label="PrismPopover"
                  targetId="prism-popover"
                />
              </div>
            )}
          </nav>
        </aside>

        {/* Visualizador Principal */}
        <main className="min-w-0">
          {activeSection === "tokens" ? (
            <div className="flex flex-col">
              {/* Seção: Cores Semânticas OK              {/* Seção: Cores Semânticas OKLCH */}
              <div id="colors">
                <GallerySection>
                  <GallerySectionHeader
                    description="Mapeamento das variáveis de cores ativas e corrigidas no tailwind.css."
                    title="Cores Semânticas OKLCH"
                  />
                  <GallerySectionContent className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
                    {[
                      {
                        id: "background",
                        label: "Base Surfaces",
                        title: "Background",
                        code: "bg-background text-foreground",
                      },
                      {
                        id: "card",
                        label: "Base Surfaces",
                        title: "Card",
                        code: "bg-card text-foreground",
                      },
                      {
                        id: "popover",
                        label: "Aero Surfaces",
                        title: "Popover",
                        code: "bg-popover text-foreground",
                      },
                    ].map((item) => (
                      <GalleryItem key={item.id} label={item.label}>
                        <div className="flex items-top gap-3">
                          <div
                            className={cn(
                              "size-8 rounded-lg border",
                              item.code,
                            )}
                          />
                          <div className="space-y-1">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                item.code.split(" ")[1],
                              )}
                            >
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {item.code.split(" ").map((className) => {
                                return <div key={className}>{className}</div>;
                              })}
                            </div>
                          </div>
                        </div>
                      </GalleryItem>
                    ))}
                    {/* Feedback Semântico */}
                    {[
                      {
                        id: "error",
                        label: "Feedback Colors",
                        title: "Error",
                        code: "bg-error-background text-error border-error/20",
                      },
                      {
                        id: "success",
                        label: "Feedback Colors",
                        title: "Success",
                        code: "bg-success-background text-success border-success/20",
                      },
                      {
                        id: "warning",
                        label: "Feedback Colors",
                        title: "Warning",
                        code: "bg-warning-background text-warning border-warning/20",
                      },
                      {
                        id: "info",
                        label: "Feedback Colors",
                        title: "Info",
                        code: "bg-info-background text-info border-info/20",
                      },
                    ].map((item) => (
                      <GalleryItem key={item.id} label={item.label}>
                        <div className="flex items-top gap-3">
                          <div
                            className={cn(
                              "size-8 rounded-lg border",
                              item.code,
                            )}
                          />
                          <div className="space-y-1">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                item.code.split(" ")[1],
                              )}
                            >
                              {item.title}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {item.code.split(" ").map((className) => {
                                return <div key={className}>{className}</div>;
                              })}
                            </div>
                          </div>
                        </div>
                      </GalleryItem>
                    ))}
                  </GallerySectionContent>
                </GallerySection>
              </div>

              {/* Seção: Escala de Espaçamento */}
              <div id="spacing">
                <GallerySection>
                  <GallerySectionHeader
                    description="Garante que os layouts dobrem as margens a cada nível da escala para manter a fluidez visual."
                    title="Espaçamento Exponencial"
                  />
                  <GallerySectionContent>
                    <GalleryItem
                      className="w-full max-w-md space-y-4"
                      label="Escala Modular"
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">4px (xs)</span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "4px",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">8px (sm)</span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "8px",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">
                          16px (md)
                        </span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "16px",
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-12 text-xs font-mono">
                          32px (lg)
                        </span>
                        <div
                          className="h-4 bg-primary rounded"
                          style={{
                            width: "32px",
                          }}
                        />
                      </div>
                    </GalleryItem>
                  </GallerySectionContent>
                </GallerySection>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Seção: PrismButton */}
              <div id="prism-button">
                <GallerySection>
                  <GallerySectionHeader
                    description="Componente de botão baseado no React Aria Components com suporte a estados nativos e ícones do Tabler."
                    title="PrismButton"
                  />
                  <GallerySectionContent>
                    <GalleryItem label="Default Variant">
                      <div className="flex gap-2">
                        <PrismButton variant="default">Button</PrismButton>
                        <PrismButton isDisabled variant="default">
                          Disabled
                        </PrismButton>
                      </div>
                    </GalleryItem>

                    <GalleryItem label="Ghost Variant">
                      <div className="flex gap-2">
                        <PrismButton variant="ghost">Ghost</PrismButton>
                        <PrismButton isDisabled variant="ghost">
                          Disabled
                        </PrismButton>
                      </div>
                    </GalleryItem>

                    <GalleryItem label="Com Ícones (Tabler Icons)">
                      <div className="flex gap-2">
                        <PrismButton variant="default">
                          <IconSend className="size-5" />
                          Enviar
                        </PrismButton>
                        <PrismButton
                          size="icon"
                          title="Excluir item"
                          variant="ghost"
                        >
                          <IconTrash className="size-5 text-destructive" />
                        </PrismButton>
                      </div>
                    </GalleryItem>
                    <GalleryItem label="Tamanhos (sm)">
                      <div className="flex gap-2">
                        <PrismButton size={"sm"} variant="default">
                          Enviar
                        </PrismButton>
                        <PrismButton
                          size="icon-sm"
                          title="Confirmar"
                          variant="secondary"
                        >
                          <IconCheckFilled className="size-5" />
                        </PrismButton>
                      </div>
                    </GalleryItem>
                  </GallerySectionContent>
                </GallerySection>

                {/* Seção: PrismInput */}
                <div id="prism-input">
                  <GallerySection>
                    <GallerySectionHeader
                      description="TextField acoplado com suporte a labels acessíveis e estilos visuais do Uzzina."
                      title="PrismInput"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Default Variant">
                        <PrismInput
                          label="Nome do Usuário"
                          onChange={setInputValue}
                          placeholder="Ex: Francisco Sousa"
                          value={inputValue}
                        />
                      </GalleryItem>

                      <GalleryItem label="With Prefix & Suffix">
                        <PrismInput
                          label="Pesquisar Projetos"
                          placeholder="Digite um termo..."
                          prefix={
                            <IconInfoCircle className="text-muted-foreground mx-3" />
                          }
                          suffix={
                            <PrismButton
                              className="rounded-l-none"
                              size="icon"
                              variant="ghost"
                            >
                              <IconSend />
                            </PrismButton>
                          }
                        />
                      </GalleryItem>

                      <GalleryItem
                        className="md:col-span-3"
                        label="Disabled States"
                      >
                        <div className="grid md:grid-cols-2 gap-4">
                          <PrismInput
                            isDisabled
                            label="E-mail (Desabilitado)"
                            value="contato@cnvt.com.br"
                          />
                        </div>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismAlert */}
                <div id="prism-alert">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Componentes de notificação semântica utilizando a paleta de cores corrigida no OKLCH."
                      title="PrismAlert"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Default">
                        <PrismAlert>
                          <IconInfoCircle />
                          <PrismAlertTitle>Informações Gerais</PrismAlertTitle>
                          <PrismAlertDescription>
                            Este alerta usa o tema padrão neutro do card.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Error">
                        <PrismAlert variant="error">
                          <IconAlertTriangle />
                          <PrismAlertTitle>Acesso Recusado</PrismAlertTitle>
                          <PrismAlertDescription>
                            Suas credenciais de login não são válidas no
                            sistema.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Sucess">
                        <PrismAlert variant="success">
                          <IconCheck />
                          <PrismAlertTitle>Senha Redefinida</PrismAlertTitle>
                          <PrismAlertDescription>
                            Sua senha foi atualizada com sucesso.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Warning">
                        <PrismAlert variant="warning">
                          <IconAlertCircle />
                          <PrismAlertTitle>Aviso de Sessão</PrismAlertTitle>
                          <PrismAlertDescription>
                            Sua conexão irá expirar em breve por inatividade.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                      <GalleryItem label="Info">
                        <PrismAlert variant="info">
                          <IconInfoCircle />
                          <PrismAlertTitle>
                            Atualização Disponível
                          </PrismAlertTitle>
                          <PrismAlertDescription>
                            Uma nova versão do Prism foi implementada.
                          </PrismAlertDescription>
                        </PrismAlert>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>

                {/* Seção: PrismPopover */}
                <div id="prism-popover">
                  <GallerySection>
                    <GallerySectionHeader
                      description="Popover contextual construído sobre o React Aria Components com posicionamento automático e transições suaves."
                      title="PrismPopover"
                    />
                    <GallerySectionContent>
                      <GalleryItem label="Default Popover">
                        <PrismPopover>
                          <PrismButton variant="default">
                            Abrir Popover
                          </PrismButton>
                          <PrismPopoverContent>
                            <div className="flex flex-col gap-2 w-48">
                              <span className="font-semibold text-sm">
                                Opções Rápidas
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Este é o conteúdo do popover de exemplo.
                              </p>
                            </div>
                          </PrismPopoverContent>
                        </PrismPopover>
                      </GalleryItem>

                      <GalleryItem label="Popover com Seta (Arrow)">
                        <PrismPopover>
                          <PrismButton variant="ghost">
                            Ver Notificação
                          </PrismButton>
                          <PrismPopoverContent placement="top" showArrow>
                            <div className="flex flex-col gap-1 w-64">
                              <span className="font-semibold text-xs text-primary">
                                NOVO AVISO
                              </span>
                              <p className="text-xs">
                                O PrismPopover se alinha perfeitamente com
                                qualquer gatilho.
                              </p>
                            </div>
                          </PrismPopoverContent>
                        </PrismPopover>
                      </GalleryItem>
                    </GallerySectionContent>
                  </GallerySection>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Componentes auxiliares de exibição da Galeria
interface GallerySectionProps {
  children: React.ReactNode;
}
function GallerySection({ children }: GallerySectionProps) {
  return (
    <section className={`space-y-6 px-8 py-12 border-b`}>{children}</section>
  );
}
interface GallerySectionHeaderProps {
  title: string;
  description: string;
}
function GallerySectionHeader({
  title,
  description,
}: GallerySectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3>{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
interface GallerySectionContentProps {
  children: React.ReactNode;
  className?: string;
}
function GallerySectionContent({
  children,
  className,
}: GallerySectionContentProps) {
  return <div className={className || "flex flex-wrap gap-8"}>{children}</div>;
}
interface GalleryItemProps {
  children: React.ReactNode;
  label: string;
  className?: string;
}
function GalleryItem({ children, label, className = "" }: GalleryItemProps) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
interface SidebarAnchorLinkProps {
  targetId: string;
  label: string;
  active?: boolean;
}
function SidebarAnchorLink({
  targetId,
  label,
  active,
}: SidebarAnchorLinkProps) {
  return (
    <a
      className={`text-muted-foreground hover:text-foreground py-2 pl-4 transition-colors border-l ${active ? "border-foreground" : ""}`}
      href={`#${targetId}`}
      onClick={(e) => {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
        });
      }}
    >
      {label}
    </a>
  );
}
interface SidebarTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
}
function SidebarTabButton({
  isActive,
  onClick,
  label,
  activeIcon,
  inactiveIcon,
}: SidebarTabButtonProps) {
  return (
    <button
      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all rounded-xl cursor-pointer shrink-0 hover:bg-card ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
      onClick={onClick}
    >
      {isActive ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}
