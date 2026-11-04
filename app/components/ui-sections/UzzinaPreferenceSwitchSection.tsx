import { useId, useState } from "react";
import { UPreferenceSwitch } from "~/components/uzzina/UPreferenceSwitch";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";
import {
  PropsPlayground,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

export function PreferenceSwitchPlayground() {
  const [checked, setChecked] = useState(false);
  const [label, setLabel] = useState("Notificações por e-mail");
  const [description, setDescription] = useState(
    "Receber um resumo diário das ações.",
  );
  const id = useId();

  return (
    <PropsPlayground
      caption={`${checked ? "ativo" : "inativo"} · id: ${id}`}
      preview={
        <div className="w-full max-w-md">
          <UPreferenceSwitch
            checked={checked}
            description={description}
            id={id}
            label={label}
            onCheckedChange={setChecked}
          />
        </div>
      }
      title="UPreferenceSwitch"
    >
      <PlaygroundBoolean
        label="Ativo"
        onChange={setChecked}
        prop="checked"
        value={checked}
      />
      <PlaygroundText
        label="Rótulo"
        onChange={setLabel}
        prop="label"
        value={label}
      />
      <PlaygroundText
        label="Descrição"
        onChange={setDescription}
        prop="description"
        value={description}
      />
    </PropsPlayground>
  );
}

export function UzzinaPreferenceSwitchSection() {
  return (
    <div id="uzzina-preference-switch">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Linha de preferência com rótulo, descrição e alternador Ativo/Inativo."
          title="UPreferenceSwitch"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="UPreferenceSwitch">
            <PreferenceSwitchPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
