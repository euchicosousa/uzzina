import Color from "color";
import { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * Verifica se a string é uma cor reconhecível pela biblioteca `color`.
 */
function isValidColor(raw: string): boolean {
  if (!raw) return false;
  try {
    Color(raw);
    return true;
  } catch {
    return false;
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PartnerColorPickerProps {
  /** Array de cores brutas do parceiro (ex: colors[0], colors[1]) */
  colors: string[];
  /** Cor atualmente selecionada */
  value: string;
  className?: string;
  /** Chamado apenas quando o usuário confirma uma cor válida e completa */
  onChange: (color: string) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Renderiza os swatches de cores de um parceiro + um input hex livre.
 * Componente puramente controlado: não guarda estado interno além do HexInput.
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
              className={cn(
                "w-fill aspect-3/4 rounded border border-black/5 transition-all hover:opacity-80",
                value.toLowerCase() === hex.toLowerCase() &&
                  "scale-105 ring-2 ring-primary ring-offset-1",
              )}
              onClick={() => onChange(hex)}
              style={{
                backgroundColor: hex,
              }}
              title={hex}
              type="button"
              aria-label={`Cor ${hex}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhuma cor definida para este parceiro.
        </p>
      )}

      {/* Input hex com estado interno — só confirma ao exterior quando cor é válida */}
      <HexInput onChange={onChange} value={value} />
    </div>
  );
}

// ─── HexInput ─────────────────────────────────────────────────────────────────

/**
 * Input controlado para cor hexadecimal.
 *
 * - Mantém estado interno `inputValue` que reflete exatamente o que o usuário digita.
 * - Durante a digitação: não confirma imediatamente — usa debounce de 500ms.
 * - Após 500ms sem digitar, se a cor for válida, confirma com `onChange(toHex(raw))`.
 * - No `onBlur` (backup): cancela o debounce pendente e confirma imediatamente se válido,
 *   ou reverte para o último `value` externo confirmado se inválido.
 * - Exibe indicador de erro enquanto o valor parcial não é reconhecido como cor válida.
 * - Ao receber um novo `value` externo (ex: swatch clicado), sincroniza o input.
 *
 * Por que debounce em vez de apenas onBlur?
 * O DropdownMenuContent do Radix UI fecha via portal ao clicar fora, o que pode
 * desmontar o input antes do evento de blur do React ser disparado — tornando o
 * onBlur não-confiável como único mecanismo de confirmação.
 */
function HexInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  const [overrideValue, setOverrideValue] = useState<string | null>(null);
  const inputValue = overrideValue !== null ? overrideValue : value;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpa o debounce ao desmontar
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );
  const isInvalid = inputValue.length > 0 && !isValidColor(inputValue);
  const confirm = (raw: string) => {
    if (isValidColor(raw)) {
      onChange(toHex(raw));
    }
  };
  return (
    <Input
      className={cn(
        "h-8 font-mono tracking-wider uppercase",
        isInvalid &&
          "bg-destructive/5 text-destructive ring-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
      )}
      onBlur={() => {
        // Cancela debounce pendente — confirmamos ou revertemos imediatamente
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        if (isValidColor(inputValue)) {
          onChange(toHex(inputValue));
        }
        setOverrideValue(null);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setOverrideValue(raw);

        // Cancela o debounce anterior e agenda um novo
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (isValidColor(raw)) {
          debounceRef.current = setTimeout(() => confirm(raw), 500);
        }
      }}
      placeholder="#Hex"
      value={inputValue}
    />
  );
}
