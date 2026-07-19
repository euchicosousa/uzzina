import { createFileRoute } from "@tanstack/react-router";
import {
  PrismButton,
  PrismInput,
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
} from "~/components/prism";
import { useState } from "react";
import {
  IconSend,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconAlertTriangle,
  IconInfoCircle,
  IconPalette,
  IconComponents,
} from "@tabler/icons-react";
export const Route = createFileRoute("/ui")({
  component: UIPage,
});
function UIPage() {
  const [inputValue, setInputValue] = useState("");
  const [activeSection, setActiveSection] = useState<"tokens" | "components">(
    "tokens",
  );
  const handleSectionChange = (section: "tokens" | "components") => {
    setActiveSection(section);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
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

          <nav className="flex flex-row lg:flex-col gap-1 border-b lg:border-b-0 p-4 pt-0 lg:p-0 overflow-x-auto lg:overflow-x-visible">
            <button
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all rounded-xl cursor-pointer shrink-0 ${activeSection === "tokens" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              onClick={() => handleSectionChange("tokens")}
            >
              <IconPalette className="size-4" />
              Tokens de Design
            </button>
            <button
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all rounded-xl cursor-pointer shrink-0 ${activeSection === "components" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              onClick={() => handleSectionChange("components")}
            >
              <IconComponents className="size-4" />
              Componentes de UI
            </button>
          </nav>
        </aside>

        {/* Visualizador Principal */}
        <main className="min-w-0">
          {activeSection === "tokens" ? (
            <div className="flex flex-col">
              {/* Seção: Cores Semânticas OKLCH */}
              <GallerySection>
                <GallerySectionHeader
                  description="Mapeamento das variáveis de cores ativas e corrigidas no tailwind.css."
                  title="Cores Semânticas OKLCH"
                />
                <GallerySectionContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Cores Base */}
                  <GalleryItem label="Base Surfaces">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg border bg-background" />
                        <div>
                          <div className="text-sm font-medium">Background</div>
                          <div className="text-xs text-muted-foreground">
                            bg-background
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg border bg-surface" />
                        <div>
                          <div className="text-sm font-medium">
                            Surface (Substituiu o Card)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            bg-surface
                          </div>
                        </div>
                      </div>
                    </div>
                  </GalleryItem>

                  {/* Feedback Semântico */}
                  <GalleryItem
                    className="md:col-span-2"
                    label="Feedback Colors"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg border bg-error-background border-error/20" />
                        <div>
                          <div className="text-sm font-medium text-error">
                            Error
                          </div>
                          <div className="text-xs text-muted-foreground">
                            text-error / bg-error-background
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg border bg-success-background border-success/20" />
                        <div>
                          <div className="text-sm font-medium text-success">
                            Success
                          </div>
                          <div className="text-xs text-muted-foreground">
                            text-success / bg-success-background
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg border bg-warning-background border-warning/20" />
                        <div>
                          <div className="text-sm font-medium text-warning">
                            Warning
                          </div>
                          <div className="text-xs text-muted-foreground">
                            text-warning / bg-warning-background
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg border bg-info-background border-info/20" />
                        <div>
                          <div className="text-sm font-medium text-info">
                            Info
                          </div>
                          <div className="text-xs text-muted-foreground">
                            text-info / bg-info-background
                          </div>
                        </div>
                      </div>
                    </div>
                  </GalleryItem>
                </GallerySectionContent>
              </GallerySection>

              {/* Seção: Escala de Espaçamento */}
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
                      <span className="w-12 text-xs font-mono">16px (md)</span>
                      <div
                        className="h-4 bg-primary rounded"
                        style={{
                          width: "16px",
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-12 text-xs font-mono">32px (lg)</span>
                      <div
                        className="h-4 bg-primary rounded"
                        style={{
                          width: "32px",
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="w-12 text-xs font-mono">64px (xl)</span>
                      <div
                        className="h-4 bg-primary rounded"
                        style={{
                          width: "64px",
                        }}
                      />
                    </div>
                  </GalleryItem>
                </GallerySectionContent>
              </GallerySection>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Seção: PrismButton */}
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
                </GallerySectionContent>
              </GallerySection>

              {/* Seção: PrismInput */}
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

              {/* Seção: PrismAlert */}
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
                        Suas credenciais de login não são válidas no sistema.
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
                  <GalleryItem label="Sucess">
                    <PrismAlert variant="info">
                      <IconInfoCircle />
                      <PrismAlertTitle>Atualização Disponível</PrismAlertTitle>
                      <PrismAlertDescription>
                        Uma nova versão do Prism foi implementada.
                      </PrismAlertDescription>
                    </PrismAlert>
                  </GalleryItem>
                </GallerySectionContent>
              </GallerySection>
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
  return (
    <div className={className || "flex flex-wrap gap-8 items-center"}>
      {children}
    </div>
  );
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
