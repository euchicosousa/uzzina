import { PipetteIcon } from "lucide-react";
import { PrismLabel } from "~/components/prism";
import type { ThemeColorKey, ThemeMode } from "~/lib/custom-theme";
import type { CustomTheme } from "~/lib/preferences";

const MODES: { mode: ThemeMode; title: string }[] = [
  { mode: "light", title: "Modo Claro" },
  { mode: "dark", title: "Modo Escuro" },
];

const FIELDS: { key: ThemeColorKey; label: string }[] = [
  { key: "primaryHex", label: "Destaque (Accent)" },
  { key: "primaryFgHex", label: "Texto no Destaque (Accent Fg)" },
  { key: "bgHex", label: "Fundo (Background)" },
  { key: "fgHex", label: "Texto (Foreground)" },
];

export function CustomThemePanel({
  theme,
  onChange,
}: {
  theme: CustomTheme;
  onChange: (mode: ThemeMode, key: ThemeColorKey, value: string) => void;
}) {
  return (
    <div className="grid gap-4 rounded-xl border bg-zinc-50/50 p-4 dark:bg-zinc-950/20">
      <div className="flex items-center gap-2 border-b pb-2">
        <PipetteIcon className="size-4 text-primary" />
        <span className="text-sm font-semibold">Editar Tema Personalizado</span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {MODES.map(({ mode, title }) => (
          <div className="flex flex-col gap-4" key={mode}>
            <span className="text-xs font-semibold text-muted-foreground">
              {title}
            </span>
            <div className="grid gap-3">
              {FIELDS.map(({ key, label }) => (
                <div className="flex flex-col gap-1.5" key={key}>
                  <PrismLabel className="text-xs text-muted-foreground">
                    {label}
                  </PrismLabel>
                  <label className="group flex cursor-pointer items-center gap-2">
                    <div
                      className="size-8 rounded-lg border border-border shadow-sm transition duration-200 group-hover:scale-105"
                      style={{ backgroundColor: theme[mode][key] }}
                    />
                    <input
                      className="sr-only"
                      onChange={(e) => onChange(mode, key, e.target.value)}
                      type="color"
                      value={theme[mode][key]}
                    />
                    <span className="font-mono text-xs text-muted-foreground select-none group-hover:text-foreground">
                      {theme[mode][key]}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Derived elements preview */}
      <div className="mt-2 border-t pt-3">
        <span className="mb-2 block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Pré-visualização de Elementos Derivados
        </span>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col justify-between rounded-lg border bg-primary p-3 text-primary-foreground">
            <span className="text-xs font-semibold">Botão Destaque</span>
            <span className="text-[9px] opacity-80">Usa o Accent Fg</span>
          </div>
          <div className="rounded-lg border bg-card p-3 text-card-foreground">
            <span className="block text-xs font-semibold">Card & Popover</span>
            <span className="text-[9px] text-muted-foreground">
              Fundo & texto derivados.
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted p-3 text-muted-foreground">
            <span className="text-xs font-semibold">Muted</span>
            <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[9px] text-foreground">
              Borda
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
