import { useState } from "react";
import { PrismTextarea } from "~/components/prism";
import {
  GalleryItem,
  GallerySection,
  GallerySectionContent,
  GallerySectionHeader,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

function TextareaPlayground() {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [placeholder, setPlaceholder] = useState("Escreva algo...");

  return (
    <PropsPlayground
      caption="PrismTextarea"
      preview={
        <div className="w-full max-w-md">
          <PrismTextarea
            aria-invalid={isInvalid || undefined}
            aria-label="Exemplo de textarea"
            disabled={isDisabled}
            placeholder={placeholder}
          />
        </div>
      }
      title="Textarea"
    >
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="disabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Inválido"
        onChange={setIsInvalid}
        prop="aria-invalid"
        value={isInvalid}
      />
      <PlaygroundText
        label="Placeholder"
        onChange={setPlaceholder}
        prop="placeholder"
        value={placeholder}
      />
    </PropsPlayground>
  );
}

export function TextareaSection() {
  return (
    <div id="prism-textarea">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Campo de entrada de texto multilinhas para descrições, observações e comentários."
          title="Textarea"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Textarea">
            <TextareaPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
