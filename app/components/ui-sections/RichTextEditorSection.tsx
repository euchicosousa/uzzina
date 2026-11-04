import { useState } from "react";
import { RichTextEditor } from "~/components/features/RichTextEditor";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

const PRESET_OPTIONS = ["short", "long", "empty"] as const;
type PresetKey = (typeof PRESET_OPTIONS)[number];

const PRESET_LABELS: Record<PresetKey, string> = {
  short: "Curto",
  long: "Longo",
  empty: "Vazio",
};

const PRESETS: Record<PresetKey, string> = {
  empty: "",
  short:
    "<p>Texto com <strong>formatação rica</strong>, <em>ênfase</em> e estrutura de parágrafos para ações do Uzzina.</p>",
  long: "<h2>Planejamento Estratégico</h2><p>Primeiro parágrafo com <strong>negrito</strong>, <em>itálico</em> e estrutura completa de parágrafos para ações da equipe.</p><ul><li>Publicação principal no feed</li><li>Reels institucional com parceiro</li><li>Série de stories interativos</li></ul><p>Texto final com orientações para revisão e publicação no prazo.</p>",
};

export function RichTextEditorPlayground() {
  const [preset, setPreset] = useState<PresetKey>("short");
  const [content, setContent] = useState<string>(PRESETS.short);
  const [compactToolbar, setCompactToolbar] = useState(false);
  const [isRounded, setIsRounded] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [placeholder, setPlaceholder] = useState("Escreva algo...");

  const handlePresetChange = (value: PresetKey) => {
    setPreset(value);
    setContent(PRESETS[value] ?? "");
  };

  return (
    <PropsPlayground
      caption={`${content.length} caracteres HTML`}
      preview={
        <div className="w-full max-w-2xl">
          <RichTextEditor
            key={`${preset}-${disabled}-${placeholder}`}
            compactToolbar={compactToolbar}
            content={content}
            disabled={disabled}
            handleChange={setContent}
            isRounded={isRounded}
            placeholder={placeholder}
          />
        </div>
      }
      previewClassName="items-start"
      title="RichTextEditor"
    >
      <PlaygroundRadio
        label="Conteúdo"
        onChange={handlePresetChange}
        optionLabels={PRESET_LABELS}
        options={PRESET_OPTIONS}
        prop="content"
        value={preset}
      />
      <PlaygroundBoolean
        label="Barra compacta"
        onChange={setCompactToolbar}
        prop="compactToolbar"
        value={compactToolbar}
      />
      <PlaygroundBoolean
        label="Arredondado"
        onChange={setIsRounded}
        prop="isRounded"
        value={isRounded}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setDisabled}
        prop="disabled"
        value={disabled}
      />
      <PlaygroundText
        label="Placeholder"
        onChange={setPlaceholder}
        placeholder="Texto de orientação..."
        prop="placeholder"
        value={placeholder}
      />
    </PropsPlayground>
  );
}

export function RichTextEditorSection() {
  return (
    <div id="uzzina-rich-text-editor">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Editor de texto rico baseado em Tiptap e React Aria Toolbar, com comandos essenciais, atalhos de teclado e modo compacto."
          title="RichTextEditor"
        />
        <GallerySectionContent>
          <RichTextEditorPlayground />
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
