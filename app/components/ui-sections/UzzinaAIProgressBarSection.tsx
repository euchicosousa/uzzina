import { useState } from "react";
import { UAIProgressBar } from "~/components/uzzina/UAIProgressBar";
import { PrismButton } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundBoolean,
} from "./PropsPlayground";

const VARIANTS = ["line", "circle"] as const;

export function AIProgressBarPlayground() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("line");
  const [completedCount, setCompletedCount] = useState(0);

  return (
    <PropsPlayground
      caption={`isGenerating={${String(isGenerating)}} · variant="${variant}" · durationMs={30000}${completedCount > 0 ? ` · concluído ${completedCount}x` : ""}`}
      preview={
        <div className="flex w-full max-w-md flex-col items-center justify-center gap-6 p-6">
          <div className="flex w-full flex-col gap-2 rounded-xl border border-border/60 bg-secondary p-4">
            <div className="flex items-center justify-between text-xs text-secondary-foreground">
              <span>Simulação de Campo / Editor</span>
              <span>{isGenerating ? "Gerando..." : "Pronto"}</span>
            </div>

            {/* Linha ultra fina no topo ou círculo */}
            <div className="flex w-full items-center justify-center py-2">
              <UAIProgressBar
                isGenerating={isGenerating}
                onComplete={() => setCompletedCount((c) => c + 1)}
                variant={variant}
              />
            </div>

            <div className="h-16 w-full rounded-md border border-border/40 bg-background/50 p-2 text-xs text-secondary-foreground">
              {isGenerating
                ? "Aguardando retorno da IA... campo desabilitado."
                : "Conteúdo pronto para edição."}
            </div>
          </div>

          <div className="flex gap-2">
            <PrismButton
              size="sm"
              variant={isGenerating ? "error" : "default"}
              onClick={() => setIsGenerating((prev) => !prev)}
            >
              {isGenerating ? "Parar (Sucesso IA)" : "Iniciar Geração (30s)"}
            </PrismButton>
          </div>
        </div>
      }
      title="UAIProgressBar"
    >
      <PlaygroundBoolean
        label="Em andamento (isGenerating)"
        onChange={setIsGenerating}
        prop="isGenerating"
        value={isGenerating}
      />
      <PlaygroundSelect
        label="Variante (variant)"
        onChange={setVariant}
        options={VARIANTS}
        prop="variant"
        value={variant}
      />
    </PropsPlayground>
  );
}

export function UzzinaAIProgressBarSection() {
  const [demoLineGenerating, setDemoLineGenerating] = useState(false);
  const [demoCircleGenerating, setDemoCircleGenerating] = useState(false);

  return (
    <div id="uzzina-ai-progress-bar">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Barra de progresso simulado (h-px, sem rounded) e indicador circular que avançam suavemente até 90% em 30s e depois de 1% em 1% por segundo até 99%, saltando para 100% no retorno real."
          title="UAIProgressBar"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Playground">
            <AIProgressBarPlayground />
          </GalleryItem>

          <GalleryItem label="Exemplos Práticos">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Exemplo Linha */}
              <div className="flex flex-col gap-3 rounded-2xl border bg-card/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Variante Linha (h-px)
                  </span>
                  <PrismButton
                    size="xs"
                    variant="outline"
                    onClick={() => setDemoLineGenerating((g) => !g)}
                  >
                    {demoLineGenerating ? "Finalizar" : "Testar Linha"}
                  </PrismButton>
                </div>
                <div className="w-full overflow-hidden border border-border/40 bg-background">
                  <UAIProgressBar
                    isGenerating={demoLineGenerating}
                    variant="line"
                  />
                  <div className="p-4 text-xs text-secondary-foreground">
                    Linha contínua integrada na borda de corte, sem rounded,
                    trilho em bg-secondary e avanço em bg-primary.
                  </div>
                </div>
              </div>

              {/* Exemplo Círculo */}
              <div className="flex flex-col gap-3 rounded-2xl border bg-card/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Variante Círculo
                  </span>
                  <PrismButton
                    size="xs"
                    variant="outline"
                    onClick={() => setDemoCircleGenerating((g) => !g)}
                  >
                    {demoCircleGenerating ? "Finalizar" : "Testar Círculo"}
                  </PrismButton>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background p-4">
                  <UAIProgressBar
                    isGenerating={demoCircleGenerating}
                    variant="circle"
                  />
                  <span className="text-xs text-secondary-foreground">
                    {demoCircleGenerating
                      ? "Gerando resposta no botão..."
                      : "Pronto para gerar"}
                  </span>
                </div>
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
