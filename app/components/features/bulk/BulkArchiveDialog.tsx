import {
  PrismButton,
  PrismDialog,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
} from "~/components/prism";
interface BulkArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
}
export function BulkArchiveDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: BulkArchiveDialogProps) {
  if (!open) return null;
  const actionText = selectedCount === 1 ? "1 ação" : `${selectedCount} ações`;
  const selectedText =
    selectedCount === 1
      ? "1 ação selecionada"
      : `${selectedCount} ações selecionadas`;
  return (
    <PrismDialog
      className="max-w-md p-0 overflow-hidden"
      isDismissable
      isOpen={open}
      onOpenChange={onOpenChange}
    >
      <PrismDialogHeader>
        <PrismDialogTitle>Confirmar arquivamento</PrismDialogTitle>
      </PrismDialogHeader>
      <div className="px-5 text-base py-4 opacity-50">
        Você está prestes a arquivar {selectedText}.
      </div>
      <PrismDialogFooter>
        <PrismButton
          onClick={() => onOpenChange(false)}
          size="sm"
          variant="ghost"
        >
          Cancelar
        </PrismButton>
        <PrismButton onClick={onConfirm} size="sm" variant="destructive">
          Arquivar {actionText}
        </PrismButton>
      </PrismDialogFooter>
    </PrismDialog>
  );
}
