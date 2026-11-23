import { Trash2Icon } from "lucide-react";
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
import type { PartnerDeletePreview } from "~/lib/partner-delete-contract";

interface PartnerDeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preview: PartnerDeletePreview;
  isDeleting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
}

export function PartnerDeleteConfirmDialog({
  isOpen,
  onOpenChange,
  preview,
  isDeleting,
  errorMessage,
  onConfirm,
}: PartnerDeleteConfirmDialogProps) {
  const [typedSlug, setTypedSlug] = useState("");
  const expectedSlug = preview.partner.slug;
  const matchesSlug = typedSlug.trim() === expectedSlug;

  useEffect(() => {
    if (!isOpen) {
      setTypedSlug("");
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!matchesSlug || isDeleting) return;
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
            Excluir "{preview.partner.title}" definitivamente?
          </PrismDialogTitle>
          <PrismDialogDescription>
            Esta operação é permanente e não pode ser desfeita depois de
            confirmada.
          </PrismDialogDescription>
        </PrismDialogHeader>

        <PrismDialogBody className="gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-sm squircle">
            <ul className="grid gap-1.5 text-secondary-foreground">
              <li>
                <strong className="text-foreground">Serão excluídos:</strong>{" "}
                {preview.exclusiveActions.length} ação(ões) exclusiva(s),{" "}
                {preview.exclusiveClients.length} conta(s) de cliente,{" "}
                {preview.topics.length} tópico(s),{" "}
                {preview.planning.socialPlansCount} proposta(s) de planejamento
                e {preview.reviewLinks.totalCount} link(s) de revisão.
              </li>
              <li>
                <strong className="text-foreground">Serão mantidos:</strong>{" "}
                {preview.sharedActions.length} ação(ões) compartilhada(s) e{" "}
                {preview.sharedClients.length} conta(s) de cliente com outros
                parceiros (apenas desvinculados desta marca).
              </li>
              <li>
                <strong className="text-foreground">Cloudinary:</strong> nenhum
                arquivo será apagado agora (
                {preview.media.orphanCandidatesCount} candidato(s) ficarão sem
                vínculo para a limpeza separada).
              </li>
            </ul>
          </div>

          {errorMessage && (
            <PrismAlert variant="error">
              <PrismAlertTitle>Não foi possível concluir</PrismAlertTitle>
              <PrismAlertDescription>{errorMessage}</PrismAlertDescription>
            </PrismAlert>
          )}

          <div className="grid gap-2">
            <PrismLabel htmlFor="confirm-partner-slug">
              Para confirmar, digite{" "}
              <code className="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-foreground">
                {expectedSlug}
              </code>
            </PrismLabel>
            <PrismInput
              autoComplete="off"
              disabled={isDeleting}
              id="confirm-partner-slug"
              onChange={(event) => setTypedSlug(event.target.value)}
              placeholder={expectedSlug}
              value={typedSlug}
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
            isDisabled={!matchesSlug || isDeleting}
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
                Excluir definitivamente
                <Trash2Icon />
              </>
            )}
          </PrismButton>
        </PrismDialogFooter>
      </form>
    </PrismDialog>
  );
}
