import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn, getGridCols, safeColor } from "~/lib/utils";
import type { Action } from "~/models/actions.server";
import { PartnerColorPicker } from "./PartnerColorPicker";

interface ActionColorDropdownProps {
  action: Action;
  partners: Partner[];
  /** Chamado quando o usuário seleciona ou digita uma nova cor */
  onSelect?: (color: string) => void;
  tabIndex?: number;
}

/**
 * Dropdown de seleção de cor para uma ação individual.
 * Exibe um botão com a cor atual e abre um painel com os swatches do parceiro + input hex.
 * Posicionado no footer do form (EssentialsTab → ActionFormFooter).
 */
export function ActionColorDropdown({
  action,
  partners,
  onSelect,
  tabIndex,
}: ActionColorDropdownProps) {
  // Cor atual normalizada e validada — safeColor retorna #666666 se inválida ou nula
  const normalizedActionColor = useMemo(
    () => safeColor(action.color),
    [action.color],
  );

  const [selected, setSelected] = useState(normalizedActionColor);

  // Sincroniza quando a prop muda externamente (ex: troca de ação no painel)
  useEffect(() => {
    setSelected(normalizedActionColor);
  }, [normalizedActionColor]);

  // Agrega todas as cores de todos os parceiros associados à ação
  const partnerColors = useMemo(
    () => partners.flatMap((p) => p.colors ?? []),
    [partners],
  );

  const handleChange = (color: string) => {
    setSelected(color);
    onSelect?.(color);
  };

  return (
    <DropdownMenu>
      {/* Botão trigger: bolinha com a cor atual da ação */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          tabIndex={tabIndex}
          className="hover:bg-secondary focus:bg-secondary/50 flex items-center gap-2 p-6 text-sm outline-none"
        >
          <div
            className="size-5 rounded-full border border-black/5"
            style={{ backgroundColor: normalizedActionColor }}
          />
        </button>
      </DropdownMenuTrigger>

      {/* Painel: swatches + input hex via componente compartilhado */}
      <DropdownMenuContent className={cn("w-40 p-2")}>
        <PartnerColorPicker
          colors={partnerColors}
          value={selected}
          onChange={handleChange}
          className={getGridCols(partnerColors.length)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
