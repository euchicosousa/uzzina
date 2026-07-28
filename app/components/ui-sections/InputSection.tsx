import { useState } from "react";
import { TextField, Label } from "react-aria-components";
import { IconAt, IconLock, IconEye } from "@tabler/icons-react";
import {
  PrismInput,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupInput,
  PrismButton,
  PrismTimeField,
  PrismColorField,
  PrismColorArea,
  PrismColorSlider,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function InputSection() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div id="prism-input">
      <GallerySection>
        <GallerySectionHeader
          description="TextField acoplado com suporte a labels acessíveis e estilos visuais do Uzzina."
          title="PrismInput"
        />
        <GallerySectionContent>
          <GalleryItem label="Default Input (Simple - h-12)">
            <TextField onChange={setInputValue} value={inputValue}>
              <Label className="block font-medium text-foreground cursor-pointer mb-1.5 text-sm">
                Nome do Usuário (Default - 48px)
              </Label>
              <PrismInput placeholder="Ex: Francisco Sousa" size="default" />
            </TextField>
          </GalleryItem>

          <GalleryItem label="Small Input (sm - h-10)">
            <TextField>
              <Label className="block font-medium text-foreground cursor-pointer mb-1.5 text-sm">
                Nome do Usuário (Small - 40px)
              </Label>
              <PrismInput placeholder="Ex: Chico Sousa" size="sm" />
            </TextField>
          </GalleryItem>

          <GalleryItem label="Input Group (With Prefix @)">
            <TextField>
              <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                Recuperar Usuário
              </Label>
              <PrismInputGroup>
                <PrismInputGroupAddon
                  align="inline-start"
                  className="[&_svg]:text-foreground/40 pl-4 pr-1"
                >
                  <IconAt className="size-5" />
                </PrismInputGroupAddon>
                <PrismInputGroupInput
                  className="px-3 h-full"
                  placeholder="seu-username"
                />
              </PrismInputGroup>
            </TextField>
          </GalleryItem>

          <GalleryItem label="Input Group (Password Toggle)">
            <TextField>
              <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                Senha Secreta
              </Label>
              <PrismInputGroup>
                <PrismInputGroupAddon
                  align="inline-start"
                  className="[&_svg]:text-foreground/40 pl-4 pr-1"
                >
                  <IconLock className="size-5" />
                </PrismInputGroupAddon>
                <PrismInputGroupInput
                  className="px-3 h-full"
                  placeholder="••••••••"
                  type="password"
                />
                <PrismInputGroupAddon
                  align="inline-end"
                  className="pr-2 pl-1"
                >
                  <PrismButton size="icon-sm" variant="ghost">
                    <IconEye className="size-4" />
                  </PrismButton>
                </PrismInputGroupAddon>
              </PrismInputGroup>
            </TextField>
          </GalleryItem>

          <GalleryItem
            className="md:col-span-3"
            label="Disabled States"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <TextField isDisabled value="contato@cnvt.com.br">
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  E-mail (Desabilitado)
                </Label>
                <PrismInput />
              </TextField>

              <div>
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  PrismTimeField (RAC)
                </Label>
                <PrismTimeField aria-label="Horário" />
              </div>

              <div>
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  PrismColorField (RAC)
                </Label>
                <PrismColorField aria-label="Código Hex de Cor" defaultValue="#FF5733" />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="block font-medium text-foreground cursor-pointer mb-1.5">
                  PrismColorArea & PrismColorSlider (RAC)
                </Label>
                <PrismColorArea defaultValue="#FF5733" />
                <PrismColorSlider defaultValue="#FF5733" />
              </div>
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
