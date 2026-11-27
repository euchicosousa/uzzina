import { CLOUDINARY_PERMANENT_CONFIRMATION } from "~/lib/cloudinary-audit-contract";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PrismAlert,
  PrismAlertDescription,
  PrismAlertTitle,
  PrismButton,
  PrismDialog,
  PrismDialogBody,
  PrismDialogDescription,
  PrismDialogFooter,
  PrismDialogHeader,
  PrismDialogTitle,
  PrismInput,
  PrismLabel,
} from "~/components/prism";
import { ULoader } from "~/components/uzzina/ULoader";

interface CloudinaryDeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  formattedTotalBytes: string;
  affectedActionsCount?: number;
  isDeleting: boolean;
  permanent?: boolean;
  backupOnlyCount?: number;
  errorMessage: string | null;
  onConfirm: () => void;
}

const CONFIRMATION_WORD = "EXCLUIR";

export function CloudinaryDeleteConfirmDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  formattedTotalBytes,
  affectedActionsCount = 0,
  isDeleting,
  permanent = false,
  backupOnlyCount = 0,
  errorMessage,
  onConfirm,
}: CloudinaryDeleteConfirmDialogProps) {
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const backupsOnly = selectedCount > 0 && backupOnlyCount === selectedCount;
  const confirmationWord = permanent
    ? CLOUDINARY_PERMANENT_CONFIRMATION
    : CONFIRMATION_WORD;
  const canConfirm =
    typedConfirmation.trim().toUpperCase() === confirmationWord;

  useEffect(() => {
    if (!isOpen) {
      setTypedConfirmation("");
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canConfirm || isDeleting) return;
    onConfirm();
  };

  return (
    <PrismDialog
      isDismissable={!isDeleting}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!isDeleting) onOpenChange(open);
      }}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <PrismDialogHeader>
          <PrismDialogTitle>
            {backupsOnly
              ? `Apagar só os backups de ${selectedCount} arquivo(s)?`
              : `${permanent ? "Excluir definitivamente" : "Excluir"} ${selectedCount} arquivo(s) do Cloudinary?`}
          </PrismDialogTitle>
          <PrismDialogDescription>
            {backupsOnly
              ? "A limpeza remove as versões de backup dos arquivos sem vínculo. Os originais existentes e seus derivados ficam preservados."
              : permanent
                ? `O Cloudinary removerá os originais, derivados e versões de backup dos arquivos selecionados. A exclusão das versões impede a restauração. Originais selecionados: ${formattedTotalBytes}.`
                : affectedActionsCount > 0
                  ? `Esta ação remove os arquivos selecionados definitivamente do Cloudinary, limpa os links correspondentes em ${affectedActionsCount} ação(ões) da UZZINA e libera cerca de ${formattedTotalBytes}.`
                  : `Esta ação remove os arquivos selecionados definitivamente do Cloudinary e libera cerca de ${formattedTotalBytes}.`}
          </PrismDialogDescription>
        </PrismDialogHeader>

        <PrismDialogBody className="gap-4">
          {affectedActionsCount > 0 ? (
            <PrismAlert variant="warning">
              <AlertTriangleIcon />
              <PrismAlertTitle>
                Atenção: desvinculação automática em ações
              </PrismAlertTitle>
              <PrismAlertDescription>
                Os arquivos excluídos serão removidos dos anexos e mídias de{" "}
                <strong>{affectedActionsCount}</strong> ação(ões) da UZZINA.
                Arquivos usados também em logotipos, avatares ou textos
                continuam protegidos e serão pulados.
              </PrismAlertDescription>
            </PrismAlert>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-secondary-foreground squircle">
              Antes de apagar cada arquivo, o servidor reconfere todas as
              tabelas da UZZINA, a regra das últimas 24 horas e a origem da
              pasta. Se algum arquivo tiver ganhado vínculo durante sua revisão,
              ele será pulado automaticamente e preservado.
            </div>
          )}

          {errorMessage && (
            <PrismAlert variant="error">
              <PrismAlertTitle>Não foi possível excluir</PrismAlertTitle>
              <PrismAlertDescription>{errorMessage}</PrismAlertDescription>
            </PrismAlert>
          )}

          <div className="grid gap-2">
            <PrismLabel htmlFor="confirm-cloudinary-delete">
              Para confirmar, digite{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
                {confirmationWord}
              </code>
            </PrismLabel>
            <PrismInput
              autoComplete="off"
              disabled={isDeleting}
              id="confirm-cloudinary-delete"
              onChange={(event) => setTypedConfirmation(event.target.value)}
              placeholder={confirmationWord}
              value={typedConfirmation}
            />
          </div>
        </PrismDialogBody>

        <PrismDialogFooter>
          <PrismButton
            isDisabled={isDeleting}
            onPress={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancelar
          </PrismButton>
          <PrismButton
            isDisabled={!canConfirm || isDeleting}
            type="submit"
            variant="error"
          >
            {isDeleting ? (
              <>
                Excluindo...
                <ULoader className="size-4" />
              </>
            ) : (
              <>
                {permanent ? "Excluir definitivamente" : "Excluir selecionados"}
                <Trash2Icon />
              </>
            )}
          </PrismButton>
        </PrismDialogFooter>
      </form>
    </PrismDialog>
  );
}
