import { useState } from "react";
import { RichTextEditor } from "~/components/features/RichTextEditor";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function RichTextEditorSection() {
  const [contentFull, setContentFull] = useState(
    "<p>Texto com <strong>formatação rica</strong>, <em>ênfase</em> e estrutura de parágrafos para ações do Uzzina.</p>",
  );
  const [contentCompact, setContentCompact] = useState(
    "<p>Editor com <strong>barra compacta</strong> ('Mais formatação') para painéis estreitos ou gaveta compacta.</p>",
  );

  return (
    <div id="uzzina-rich-text-editor">
      <GallerySection>
        <GallerySectionHeader
          description="Editor de texto rico baseado em Tiptap e React Aria Toolbar, com comandos essenciais, atalhos de teclado e modo compacto."
          title="RichTextEditor"
        />
        <GallerySectionContent className="grid gap-8">
          <GalleryItem label="Barra Completa (Desktop / Gaveta Padrão)">
            <div className="w-full max-w-3xl rounded-2xl border bg-card p-4 squircle">
              <RichTextEditor
                content={contentFull}
                handleChange={setContentFull}
                placeholder="Escreva a descrição da ação..."
              />
            </div>
          </GalleryItem>

          <GalleryItem label="Barra Compacta (compactToolbar - Painéis estreitos)">
            <div className="w-full max-w-xl rounded-2xl border bg-card p-4 squircle">
              <RichTextEditor
                compactToolbar
                content={contentCompact}
                handleChange={setContentCompact}
                placeholder="Escreva com a barra compacta..."
              />
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
