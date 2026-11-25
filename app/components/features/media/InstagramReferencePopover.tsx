import { LinkIcon } from "lucide-react";
import { useId, useState } from "react";
import { Dialog, Label } from "react-aria-components";
import {
  PrismButton,
  PrismInput,
  PrismPopover,
  PrismPopoverTrigger,
  PrismSelect,
  PrismSelectContent,
  PrismSelectItem,
  PrismSelectTrigger,
  PrismSelectValue,
} from "~/components/prism";
import { normalizeInstagramReference } from "~/lib/instagram-reference";
import type { ReferenceContext } from "~/models/instagram-reference";

export type ReferenceTarget = {
  actionId?: string;
  partners: readonly { slug: string; title: string }[];
};

const INVALID_LINK_MESSAGE =
  "Cole um link público de post (/p/) ou Reel (/reel/) do Instagram.";

export function InstagramReferencePopover({
  target,
  busy,
  start,
  onOpenChange,
}: {
  target: ReferenceTarget;
  busy: boolean;
  start: (
    context: ReferenceContext,
    url: string,
    onPrepared: () => void,
  ) => Promise<string | null>;
  onOpenChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const helpId = useId();
  const errorId = useId();
  const linkId = useId();
  const normalizedUrl = normalizeInstagramReference(url);
  const partnerSlug =
    target.partners.length === 1
      ? target.partners[0]?.slug
      : target.partners.some((partner) => partner.slug === selected)
        ? selected
        : "";
  function showInvalidLinkError() {
    if (url.trim().length > 0 && !normalizedUrl) {
      setError(INVALID_LINK_MESSAGE);
    }
  }
  function changeOpen(value: boolean) {
    setOpen(value);
    onOpenChange(value);
    if (value) setError(null);
  }

  return (
    <PrismPopoverTrigger isOpen={open} onOpenChange={changeOpen}>
      <PrismButton
        aria-label="Importar arquivos por link"
        size="icon-sm"
        variant="secondary"
      >
        <LinkIcon />
      </PrismButton>
      <PrismPopover placement="top start">
        <Dialog
          aria-label="Importar arquivos por link"
          className="outline-none"
        >
          {!target.actionId || !target.partners.length ? (
            <p>Salve a ação com um parceiro para importar arquivos por link.</p>
          ) : (
            <form
              noValidate
              className="flex flex-col gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (busy || !target.actionId) return;
                if (!normalizedUrl) {
                  setError(INVALID_LINK_MESSAGE);
                  return;
                }
                if (!partnerSlug) {
                  setError("Escolha o parceiro que receberá os arquivos.");
                  return;
                }
                setError(null);
                const failure = await start(
                  { actionId: target.actionId, partnerSlug },
                  normalizedUrl,
                  () => {
                    setUrl("");
                    changeOpen(false);
                  },
                );
                if (failure) setError(failure);
              }}
            >
              <label htmlFor={linkId}>Link do Instagram</label>
              <PrismInput
                autoFocus
                id={linkId}
                type="url"
                value={url}
                placeholder="https://www.instagram.com/..."
                onBlur={showInvalidLinkError}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Tab") {
                    showInvalidLinkError();
                    return;
                  }
                  if (
                    event.key === "Enter" &&
                    url.trim().length > 0 &&
                    !normalizedUrl
                  ) {
                    event.preventDefault();
                    setError(INVALID_LINK_MESSAGE);
                  }
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${helpId} ${errorId}` : helpId}
              />

              {target.partners.length > 1 && (
                <PrismSelect
                  className="flex w-full flex-col gap-1"
                  isDisabled={busy}
                  placeholder="Escolha o parceiro"
                  selectedKey={partnerSlug || null}
                  onSelectionChange={(key) => {
                    setSelected(key ? String(key) : "");
                    setError(null);
                  }}
                >
                  <Label className="text-sm">Parceiro de destino</Label>
                  <PrismSelectTrigger size="sm">
                    <PrismSelectValue />
                  </PrismSelectTrigger>
                  <PrismSelectContent>
                    {target.partners.map((partner) => (
                      <PrismSelectItem key={partner.slug} id={partner.slug}>
                        {partner.title}
                      </PrismSelectItem>
                    ))}
                  </PrismSelectContent>
                </PrismSelect>
              )}
              {error && (
                <p id={errorId} role="alert" className="text-xs text-error">
                  {error}
                </p>
              )}
              <PrismButton
                type="submit"
                isDisabled={busy || !normalizedUrl}
                size="sm"
              >
                {busy ? "Consultando…" : "Importar"}
              </PrismButton>
            </form>
          )}
        </Dialog>
      </PrismPopover>
    </PrismPopoverTrigger>
  );
}
