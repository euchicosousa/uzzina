import { useEffect, useRef, useState } from "react";
import { cn } from "cnfast";

export interface UAIProgressBarProps {
  /** Indica se a operação com IA está em andamento */
  isGenerating: boolean;
  /** Variante visual: linha ultra fina (h-px) ou círculo SVG */
  variant?: "line" | "circle";
  /** Duração prevista em ms para atingir ~90% (padrão fixo: 30000ms / 30s) */
  durationMs?: number;
  /** Callback opcional quando a barra atinge 100% e conclui */
  onComplete?: () => void;
  /** Classes CSS adicionais */
  className?: string;
}

const DEFAULT_DURATION_MS = 30000;
const BASE_PROGRESS_TARGET = 90;
const MAX_PROGRESS_LIMIT = 99;

export function UAIProgressBar({
  isGenerating,
  variant = "line",
  durationMs = DEFAULT_DURATION_MS,
  onComplete,
  className,
}: UAIProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const prevGeneratingRef = useRef(isGenerating);

  // Armazena onComplete em ref para evitar re-execuções do effect quando funções anônimas forem passadas
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const wasGenerating = prevGeneratingRef.current;
    prevGeneratingRef.current = isGenerating;

    // Início da geração (ou se já montar gerando)
    if (isGenerating) {
      setVisible(true);
      setIsFinishing(false);
      setProgress(0);
      startTimeRef.current = performance.now();

      const updateProgress = (now: number) => {
        if (!startTimeRef.current) return;
        const elapsed = now - startTimeRef.current;

        if (elapsed <= durationMs) {
          // Fase 1: curva suave até 90% ao longo dos 30 segundos
          const ratio = Math.min(1, elapsed / durationMs);
          const eased = 1 - Math.pow(1 - ratio, 2.2);
          setProgress(eased * BASE_PROGRESS_TARGET);
        } else {
          // Fase 2: a partir de 90% (30s), avança de 1 em 1 por cento a cada 1 segundo até 99%
          const extraSeconds = Math.floor((elapsed - durationMs) / 1000);
          const current = Math.min(
            MAX_PROGRESS_LIMIT,
            BASE_PROGRESS_TARGET + extraSeconds,
          );
          setProgress(current);
        }

        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);

      return () => {
        if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
        }
      };
    }

    // Fim da geração (transição de true para false)
    if (wasGenerating && !isGenerating) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }

      // Ativa transição suave para 100%
      setIsFinishing(true);
      setProgress(100);
      onCompleteRef.current?.();

      // Mantém em 100% por 250ms e depois desvanece
      const fadeTimeout = setTimeout(() => {
        setVisible(false);
        const resetTimeout = setTimeout(() => {
          setProgress(0);
          setIsFinishing(false);
        }, 300);
        return () => clearTimeout(resetTimeout);
      }, 250);

      return () => clearTimeout(fadeTimeout);
    }
  }, [isGenerating, durationMs]);

  // Se não estiver visível e nem gerando, não renderiza nada no DOM
  if (!visible && !isGenerating) return null;

  if (variant === "circle") {
    const radius = 9;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div
        aria-hidden={!visible}
        aria-label="Progresso da geração com inteligência artificial"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className={cn(
          "inline-flex shrink-0 items-center justify-center transition-opacity duration-300",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
          className,
        )}
        role="progressbar"
      >
        <svg className="size-4 shrink-0 -rotate-90" viewBox="0 0 24 24">
          <circle
            className="text-input"
            cx="12"
            cy="12"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle
            className={cn(
              "text-primary",
              isFinishing
                ? "transition-[stroke-dashoffset] duration-200 ease-out"
                : "transition-none",
            )}
            cx="12"
            cy="12"
            fill="none"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  }

  // Linha ultra fina (h-px, bg-input, sem rounded)
  return (
    <div
      aria-hidden={!visible}
      aria-label="Progresso da geração com inteligência artificial"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      className={cn(
        "relative h-0.5 w-full overflow-hidden bg-input transition-opacity duration-300",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      role="progressbar"
    >
      <div
        className={cn(
          "h-full bg-primary",
          isFinishing
            ? "transition-[width] duration-200 ease-out"
            : "transition-none",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
