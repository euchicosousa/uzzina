import { useState } from "react";
import { TextField, Label } from "react-aria-components";
import { AtSignIcon, LockIcon, EyeIcon } from "lucide-react";
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
              <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                Nome do Usuário (Default - 48px)
              </Label>
              <PrismInput placeholder="Ex: Francisco Sousa" size="default" />
            </TextField>
          </GalleryItem>

          <GalleryItem label="Small Input (sm - h-10)">
            <TextField>
              <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                Nome do Usuário (Small - 40px)
              </Label>
              <PrismInput placeholder="Ex: Chico Sousa" size="sm" />
            </TextField>
          </GalleryItem>

          <GalleryItem label="Input Group (With Prefix @)">
            <TextField>
              <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                Recuperar Usuário
              </Label>
              <PrismInputGroup>
                <PrismInputGroupAddon
                  align="inline-start"
                  className="pr-1 pl-4 [&_svg]:text-foreground/40"
                >
                  <AtSignIcon className="size-5" />
                </PrismInputGroupAddon>
                <PrismInputGroupInput
                  className="h-full px-3"
                  placeholder="seu-username"
                />
              </PrismInputGroup>
            </TextField>
          </GalleryItem>

          <GalleryItem label="Input Group (Password Toggle)">
            <TextField>
              <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                Senha Secreta
              </Label>
              <PrismInputGroup>
                <PrismInputGroupAddon
                  align="inline-start"
                  className="pr-1 pl-4 [&_svg]:text-foreground/40"
                >
                  <LockIcon className="size-5" />
                </PrismInputGroupAddon>
                <PrismInputGroupInput
                  className="h-full px-3"
                  placeholder="••••••••"
                  type="password"
                />
                <PrismInputGroupAddon align="inline-end" className="pr-2 pl-1">
                  <PrismButton size="icon-sm" variant="ghost">
                    <EyeIcon className="size-4" />
                  </PrismButton>
                </PrismInputGroupAddon>
              </PrismInputGroup>
            </TextField>
          </GalleryItem>

          <GalleryItem className="md:col-span-3" label="Disabled States">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField isDisabled value="contato@cnvt.com.br">
                <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                  E-mail (Desabilitado)
                </Label>
                <PrismInput />
              </TextField>

              <div>
                <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                  PrismTimeField (RAC)
                </Label>
                <PrismTimeField aria-label="Horário" />
              </div>

              <div>
                <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
                  PrismColorField (RAC)
                </Label>
                <PrismColorField
                  aria-label="Código Hex de Cor"
                  defaultValue="#FF5733"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="mb-1.5 block cursor-pointer font-medium text-foreground">
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
