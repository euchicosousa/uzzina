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

      {/* Input hex com estado interno — só confirma ao exterior quando cor é válida */}
      <HexInput value={value} onChange={onChange} />
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
  // Estado interno de digitação — pode conter valores parciais como "#f" ou "#ff"
  const [inputValue, setInputValue] = useState(value);
  // Referência ao timer do debounce para cancelar se necessário
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza quando o valor externo muda (ex: swatch clicado ou ação trocada)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Limpa o debounce ao desmontar
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const isInvalid = inputValue.length > 0 && !isValidColor(inputValue);

  const confirm = (raw: string) => {
    if (isValidColor(raw)) {
      onChange(toHex(raw));
    }
  };

  return (
    <Input
      value={inputValue}
      placeholder="#Hex"
      className={cn(
        "h-8 font-mono tracking-wider uppercase",
        isInvalid && "text-destructive focus-visible:border-destructive ring-destructive bg-destructive/5 focus-visible:ring-destructive/20",
      )}
      onChange={(e) => {
        const raw = e.target.value;
        setInputValue(raw);

        // Cancela o debounce anterior e agenda um novo
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (isValidColor(raw)) {
          debounceRef.current = setTimeout(() => confirm(raw), 500);
        }
      }}
      onBlur={() => {
        // Cancela debounce pendente — confirmamos ou revertemos imediatamente
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        if (isValidColor(inputValue)) {
          onChange(toHex(inputValue));
        } else {
          // Cor inválida ao sair: reverte para o último valor confirmado
          setInputValue(value);
        }
      }}
    />
  );
}
