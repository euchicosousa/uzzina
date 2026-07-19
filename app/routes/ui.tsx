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
} from "@tabler/icons-react";
export const Route = createFileRoute("/ui")({
  component: UIPage,
});
function UIPage() {
  const [inputValue, setInputValue] = useState("");
  const [activeSection, setActiveSection] = useState<"tokens" | "components">(
    "tokens",
  );
  return (
    <div className="container mx-auto px-8 py-12 space-y-12">
      <div className="flex flex-col">
        <div className="border_after pb-8 lg:flex justify-between items-end gap-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">Prism</h1>
            <p className="text-muted-foreground mt-2">
              Design System proprietário do Uzzina, focado em flexibilidade,
              acessibilidade (React Aria) e estética OKLCH.
            </p>
          </div>
        </div>

        {/* Menu de Navegação Semântica */}
        <PrismNav activeSection={activeSection} onChange={setActiveSection} />
      </div>

      {activeSection === "tokens" ? (
        <div className="flex flex-col">
          {/* Seção: Cores Semânticas OKLCH */}
          <GallerySection separator>
            <GallerySectionHeader
              title="Cores Semânticas OKLCH"
              description="Mapeamento das variáveis de cores ativas e corrigidas no tailwind.css."
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
              <GalleryItem label="Feedback Colors" className="md:col-span-2">
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
                      <div className="text-sm font-medium text-info">Info</div>
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
              title="Espaçamento Exponencial"
              description="Garante que os layouts dobrem as margens a cada nível da escala para manter a fluidez visual."
            />
            <GallerySectionContent>
              <GalleryItem label="Escala Modular" className="w-full max-w-md space-y-4">
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
          <GallerySection separator>
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
                    <IconSend className="size-4" />
                    Enviar
                  </PrismButton>
                  <PrismButton size="icon" title="Excluir item" variant="ghost">
                    <IconTrash className="size-4 text-destructive" />
                  </PrismButton>
                </div>
              </GalleryItem>
            </GallerySectionContent>
          </GallerySection>

          {/* Seção: PrismInput */}
          <GallerySection separator>
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

              <GalleryItem label="Inset (Embossed) Variant">
                <PrismInput
                  label="Senha de Acesso"
                  placeholder="••••••••"
                  type="password"
                  variant="inset"
                />
              </GalleryItem>

              <GalleryItem className="md:col-span-2" label="Disabled States">
                <div className="grid md:grid-cols-2 gap-4">
                  <PrismInput
                    isDisabled
                    label="E-mail (Desabilitado)"
                    value="contato@cnvt.com.br"
                  />
                  <PrismInput
                    isDisabled
                    label="Token (Inset Desabilitado)"
                    value="A39F-84JD-2947"
                    variant="inset"
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
    </div>
  );
}
interface PrismNavProps {
  activeSection: "tokens" | "components";
  onChange: (section: "tokens" | "components") => void;
}
function PrismNav({ activeSection, onChange }: PrismNavProps) {
  return (
    <div className="flex w-full border_after">
      <button
        className={`px-4 py-3 text-sm font-semibold tracking-tight transition-all relative border-b-2 ${activeSection === "tokens" ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground border-transparent"}`}
        onClick={() => onChange("tokens")}
      >
        Tokens de Design
      </button>
      <button
        className={`px-4 py-3 text-sm font-semibold tracking-tight transition-all relative border-b-2 ${activeSection === "components" ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground border-transparent"}`}
        onClick={() => onChange("components")}
      >
        Componentes de UI
      </button>
    </div>
  );
}

// Componentes auxiliares de exibição da Galeria
interface GallerySectionProps {
  children: React.ReactNode;
  separator?: boolean;
}
function GallerySection({ children, separator = false }: GallerySectionProps) {
  return (
    <section className={`space-y-6 py-12 ${separator ? "border_after" : ""}`}>
      {children}
    </section>
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
