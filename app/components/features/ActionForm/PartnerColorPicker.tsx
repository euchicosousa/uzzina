import Color from "color";
import { useMemo } from "react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normaliza qualquer string de cor para hex (#RRGGBB) usando a biblioteca `color`.
 * Retorna o valor original como fallback se a conversão falhar.
 */
export function toHex(raw: string): string {
  try {
    return Color(raw).hex();
  } catch {
    return raw;
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PartnerColorPickerProps {
  /** Array de cores brutas do parceiro (ex: colors[0], colors[1]) */
  colors: string[];
  /** Cor atualmente selecionada */
  value: string;
  className?: string;
  /** Chamado sempre que o usuário seleciona uma cor (swatch ou hex input) */
  onChange: (color: string) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Renderiza os swatches de cores de um parceiro + um input hex livre.
 * Componente puramente controlado: não guarda estado interno.
 *
 * Usado por:
 *  - ActionColorDropdown  → inline no footer do form de ação
 *  - BulkActionMenu       → dentro de um Dialog de multi-seleção
 */
export function PartnerColorPicker({
  colors,
  value,
  className,
  onChange,
}: PartnerColorPickerProps) {
  // Normaliza as cores para hex uma única vez — evita recomputar a cada render
  const hexColors = useMemo(() => colors.map(toHex), [colors]);

  return (
    <div className="space-y-3">
      {/* Swatches do parceiro — aspecto 3:4 igual ao ActionColorDropdown original */}
      {hexColors.length > 0 ? (
        <div className={cn("grid gap-2", className)}>
          {hexColors.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              onClick={() => onChange(hex)}
              className={cn(
                "w-fill aspect-[3/4] rounded border border-black/5 transition-all hover:opacity-80",
                value.toLowerCase() === hex.toLowerCase() &&
                  "ring-primary scale-105 ring-2 ring-offset-1",
              )}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nenhuma cor definida para este parceiro.
        </p>
      )}

      {/* Input hex livre — permite cor customizada além das do parceiro */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hex"
        className="h-8 font-mono"
      />
    </div>
  );
}
