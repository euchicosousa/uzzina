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
interface BulkSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: Person[];
  selectedCount: number;
  onApply: (sprints: string[] | null) => void;
}
export function BulkSprintDialog({
  open,
  onOpenChange,
  people,
  selectedCount,
  onApply,
}: BulkSprintDialogProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<Key>>(new Set());
  const handleApply = () => {
    const sprints = Array.from(selectedKeys) as string[];
    onApply(sprints.length > 0 ? sprints : null);
    onOpenChange(false);
  };
  const handleClearSprints = () => {
    onApply(null);
    onOpenChange(false);
  };
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedKeys(new Set());
    }
    onOpenChange(isOpen);
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
        <PrismDialogTitle>Alterar Sprints</PrismDialogTitle>
        <PrismDialogDescription>
          Atribua a sprint de usuários às {selectedCount} ação(ões)
          selecionada(s) ou limpe todas as sprints.
        </PrismDialogDescription>
      </PrismDialogHeader>

      <div className="max-h-80 overflow-y-auto p-6">
        <PrismToggleGroup
          aria-label="Seleção de Sprints"
          className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4"
          onSelectionChange={(keys) => setSelectedKeys(keys as Set<Key>)}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
        >
          {people.map((person: Person) => (
            <PrismToggleGroupItem
              key={person.user_id}
              className="flex h-auto min-w-0 flex-col items-center justify-center gap-2 rounded-xl p-3 squircle"
              id={person.user_id}
            >
              <UAvatar
                fallback={person.initials}
                image={person.image ?? undefined}
                size="md"
              />
              <span className="truncate leading-tight">{person.name}</span>
            </PrismToggleGroupItem>
          ))}
        </PrismToggleGroup>
      </div>

      <PrismDialogFooter className="border-t">
        <PrismButton
          onClick={handleClearSprints}
          size="sm"
          variant="destructive"
        >
          Remover das Sprints
        </PrismButton>
        <div className="flex gap-2">
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
            Aplicar ({selectedKeys.size})
          </PrismButton>
        </div>
      </PrismDialogFooter>
    </PrismDialog>
  );
}
