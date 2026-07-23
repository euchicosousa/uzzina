import { useState } from "react";
import type { Key } from "react-aria-components";
import {
  PrismButton,
  PrismDialog,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "~/components/prism";
import { UAvatar } from "~/components/uzzina/UAvatar";
import type { Person } from "~/lib/supabase.queries";
interface BulkResponsiblesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  selectedCount: number;
  onApply: (responsibles: string[]) => void;
}
export function BulkResponsiblesDialog({
  open,
  onOpenChange,
  people,
  selectedCount,
  onApply,
}: BulkResponsiblesDialogProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set());
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedKeys(new Set());
    }
    onOpenChange(isOpen);
  };
  const handleApply = () => {
    onApply(Array.from(selectedKeys) as string[]);
    onOpenChange(false);
  };
  if (!open) return null;
  return (
    <PrismDialog
      className="max-w-md overflow-hidden"
      isDismissable
      isOpen={open}
      onOpenChange={handleOpenChange}
    >
      <PrismDialogHeader className="border-b">
        <PrismDialogTitle>Alterar Responsáveis</PrismDialogTitle>
        <PrismDialogDescription>
          Selecione quem será responsável por {selectedCount} ação(ões).
        </PrismDialogDescription>
      </PrismDialogHeader>

      <div className="py-4 px-5 max-h-80 overflow-y-auto">
        <PrismToggleGroup
          aria-label="Seleção de Responsáveis"
          className="grid grid-cols-2 gap-1 sm:grid-cols-4 w-full"
          onSelectionChange={(keys) => setSelectedKeys(keys as Set<Key>)}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
        >
          {people.map((person: Person) => (
            <PrismToggleGroupItem
              key={person.user_id}
              className="flex flex-col items-center justify-center gap-2 rounded-xl squircle p-3 h-auto min-w-0"
              id={person.user_id}
            >
              <UAvatar
                fallback={person.initials}
                image={person.image ?? undefined}
                size="lg"
              />
              <span className="w-full truncate leading-tight">
                {person.name}
              </span>
            </PrismToggleGroupItem>
          ))}
        </PrismToggleGroup>
      </div>

      <PrismDialogFooter className="border-t">
        <PrismButton
          onClick={() => onOpenChange(false)}
          size="sm"
          variant="ghost"
        >
          Cancelar
        </PrismButton>
        <PrismButton
          isDisabled={selectedKeys.size === 0}
          onClick={handleApply}
          size="sm"
        >
          Aplicar ({selectedKeys.size} selecionado
          {selectedKeys.size !== 1 ? "s" : ""})
        </PrismButton>
      </PrismDialogFooter>
    </PrismDialog>
  );
}
