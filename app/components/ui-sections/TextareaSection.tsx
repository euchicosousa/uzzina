import { useState } from "react";
import { TextField, Label } from "react-aria-components";
import { PrismTextarea } from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function TextareaSection() {
  const [value, setValue] = useState("");

  return (
    <div id="prism-textarea">
      <GallerySection>
        <GallerySectionHeader
          description="Campo de entrada de texto multilinhas para descrições, observações e comentários."
          title="PrismTextarea"
        />
        <GallerySectionContent>
          <GalleryItem className="w-full max-w-md" label="Default Textarea">
            <TextField onChange={setValue} value={value}>
              <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                Descrição da Ação
              </Label>
              <PrismTextarea placeholder="Digite a descrição detalhada..." />
            </TextField>
          </GalleryItem>

          <GalleryItem className="w-full max-w-md" label="Disabled Textarea">
            <TextField isDisabled value="Este conteúdo não pode ser editado.">
              <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                Observações (Desabilitado)
              </Label>
              <PrismTextarea />
            </TextField>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
