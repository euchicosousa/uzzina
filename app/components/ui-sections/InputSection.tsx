import { useState } from "react";
import { TextField, Label } from "react-aria-components";
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import {
  PrismInput,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupButton,
  PrismInputGroupInput,
  PrismInputGroupText,
  PrismKbd,
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

const SIZES: {
  size: "sm" | "default" | "lg";
  height: string;
  label: string;
}[] = [
  { size: "sm", height: "h-8 (32px)", label: "Tamanho sm · h-8 (32px)" },
  {
    size: "default",
    height: "h-10 (40px)",
    label: "Tamanho default · h-10 (40px)",
  },
  { size: "lg", height: "h-12 (48px)", label: "Tamanho lg · h-12 (48px)" },
];

export function InputSection() {
  const [showPassword, setShowPassword] = useState(false);
  const [searchValue, setSearchValue] = useState("UZZINA Design System");

  return (
    <div id="prism-input">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Campos de entrada de texto e grupos acoplados (Input e InputGroup) com alinhamento visual rigoroso aos botões em todos os tamanhos."
          title="Input"
        />
        <GallerySectionContent className="flex flex-col gap-10">
          <GalleryItem label="Comparação Direta de Tamanhos · Input lado a lado com Button">
            <div className="flex flex-col gap-6">
              {SIZES.map(({ size, height, label }) => (
                <div className="flex flex-col gap-2" key={size}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    {label}
                  </span>
                  <div className="flex flex-wrap items-center gap-4">
                    <PrismButton size={size} variant="default">
                      Botão ({height})
                    </PrismButton>
                    <div className="w-64">
                      <PrismInput
                        aria-label={`Input simples ${size}`}
                        placeholder={`Input simples (${size})`}
                        size={size}
                      />
                    </div>
                    <div className="w-72">
                      <PrismInputGroup size={size}>
                        <PrismInputGroupAddon align="inline-start">
                          <SearchIcon className="opacity-50" />
                        </PrismInputGroupAddon>
                        <PrismInputGroupInput
                          placeholder={`InputGroup busca (${size})`}
                        />
                      </PrismInputGroup>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GalleryItem>

          <GalleryItem label="Campos com Rótulo (Label) · sm, default e lg">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Nome Completo (sm · h-8 / 32px)
                </Label>
                <PrismInput placeholder="Ex: Chico Sousa" size="sm" />
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Nome Completo (default · h-10 / 40px)
                </Label>
                <PrismInput placeholder="Ex: Francisco Sousa" size="default" />
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Nome Completo (lg · h-12 / 48px)
                </Label>
                <PrismInput placeholder="Ex: Francisco Sousa" size="lg" />
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="InputGroup · Apenas Prefixo (Ícone de Busca) · sm, default e lg">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Busca (sm · h-8 / 32px · ícone 16px)
                </Label>
                <PrismInputGroup size="sm">
                  <PrismInputGroupAddon align="inline-start">
                    <SearchIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput placeholder="Pesquisar ações..." />
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Busca (default · h-10 / 40px · ícone 20px)
                </Label>
                <PrismInputGroup size="default">
                  <PrismInputGroupAddon align="inline-start">
                    <SearchIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput placeholder="Pesquisar ações..." />
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Busca (lg · h-12 / 48px · ícone 24px)
                </Label>
                <PrismInputGroup size="lg">
                  <PrismInputGroupAddon align="inline-start">
                    <SearchIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput placeholder="Pesquisar ações..." />
                </PrismInputGroup>
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="InputGroup · Apenas Sufixo (Status & Atalho) · sm, default e lg">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Domínio (sm · h-8 / 32px · ícone 16px)
                </Label>
                <PrismInputGroup size="sm">
                  <PrismInputGroupInput defaultValue="uzzina.app/agencia" />
                  <PrismInputGroupAddon align="inline-end">
                    <CheckIcon className="text-emerald-500" />
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Domínio (default · h-10 / 40px · ícone 20px)
                </Label>
                <PrismInputGroup size="default">
                  <PrismInputGroupInput defaultValue="uzzina.app/agencia" />
                  <PrismInputGroupAddon align="inline-end">
                    <CheckIcon className="text-emerald-500" />
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Domínio (lg · h-12 / 48px · ícone 24px)
                </Label>
                <PrismInputGroup size="lg">
                  <PrismInputGroupInput defaultValue="uzzina.app/agencia" />
                  <PrismInputGroupAddon align="inline-end">
                    <CheckIcon className="text-emerald-500" />
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="InputGroup · Prefixo de Texto (InputGroupText) · sm, default e lg">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  URL (sm · h-8 / 32px · texto 12px)
                </Label>
                <PrismInputGroup size="sm">
                  <PrismInputGroupAddon align="inline-start">
                    <PrismInputGroupText>https://</PrismInputGroupText>
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput defaultValue="uzzina.app/agencia" />
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  URL (default · h-10 / 40px · texto 14px)
                </Label>
                <PrismInputGroup size="default">
                  <PrismInputGroupAddon align="inline-start">
                    <PrismInputGroupText>https://</PrismInputGroupText>
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput defaultValue="uzzina.app/agencia" />
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  URL (lg · h-12 / 48px · texto 16px)
                </Label>
                <PrismInputGroup size="lg">
                  <PrismInputGroupAddon align="inline-start">
                    <PrismInputGroupText>https://</PrismInputGroupText>
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput defaultValue="uzzina.app/agencia" />
                </PrismInputGroup>
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="InputGroup · Prefixo e Sufixo de Ação (Senha) · sm, default e lg">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Senha (sm · h-8 / 32px · ícone 16px · botão 24px)
                </Label>
                <PrismInputGroup size="sm">
                  <PrismInputGroupAddon align="inline-start">
                    <LockIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                  />
                  <PrismInputGroupAddon align="inline-end">
                    <PrismInputGroupButton
                      aria-label={showPassword ? "Ocultar" : "Mostrar"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </PrismInputGroupButton>
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Senha (default · h-10 / 40px · ícone 20px · botão 32px)
                </Label>
                <PrismInputGroup size="default">
                  <PrismInputGroupAddon align="inline-start">
                    <LockIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                  />
                  <PrismInputGroupAddon align="inline-end">
                    <PrismInputGroupButton
                      aria-label={showPassword ? "Ocultar" : "Mostrar"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </PrismInputGroupButton>
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Senha (lg · h-12 / 48px · ícone 24px · botão 40px)
                </Label>
                <PrismInputGroup size="lg">
                  <PrismInputGroupAddon align="inline-start">
                    <LockIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                  />
                  <PrismInputGroupAddon align="inline-end">
                    <PrismInputGroupButton
                      aria-label={showPassword ? "Ocultar" : "Mostrar"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </PrismInputGroupButton>
                  </PrismInputGroupAddon>
                </PrismInputGroup>
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="InputGroup · Prefixo e Botão de Ação de Limpeza · sm, default e lg">
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Filtrar (sm · h-8 / 32px)
                </Label>
                <PrismInputGroup size="sm">
                  <PrismInputGroupAddon align="inline-start">
                    <SearchIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                  />
                  {searchValue && (
                    <PrismInputGroupAddon align="inline-end">
                      <PrismInputGroupButton
                        aria-label="Limpar busca"
                        onClick={() => setSearchValue("")}
                      >
                        <XIcon />
                      </PrismInputGroupButton>
                    </PrismInputGroupAddon>
                  )}
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Filtrar (default · h-10 / 40px)
                </Label>
                <PrismInputGroup size="default">
                  <PrismInputGroupAddon align="inline-start">
                    <SearchIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                  />
                  {searchValue && (
                    <PrismInputGroupAddon align="inline-end">
                      <PrismInputGroupButton
                        aria-label="Limpar busca"
                        onClick={() => setSearchValue("")}
                      >
                        <XIcon />
                      </PrismInputGroupButton>
                    </PrismInputGroupAddon>
                  )}
                </PrismInputGroup>
              </TextField>

              <TextField>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Filtrar (lg · h-12 / 48px)
                </Label>
                <PrismInputGroup size="lg">
                  <PrismInputGroupAddon align="inline-start">
                    <SearchIcon className="opacity-50" />
                  </PrismInputGroupAddon>
                  <PrismInputGroupInput
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                  />
                  {searchValue && (
                    <PrismInputGroupAddon align="inline-end">
                      <PrismInputGroupButton
                        aria-label="Limpar busca"
                        onClick={() => setSearchValue("")}
                      >
                        <XIcon />
                      </PrismInputGroupButton>
                    </PrismInputGroupAddon>
                  )}
                </PrismInputGroup>
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="Estados (Desabilitado e Inválido) · default · h-10 (40px)">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField isDisabled value="contato@cnvt.com.br">
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-muted-foreground">
                  E-mail (Desabilitado · default · 40px)
                </Label>
                <PrismInput size="default" />
              </TextField>

              <TextField isInvalid value="usuario_invalido">
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-destructive">
                  Nome de Usuário (Inválido / Erro · default · 40px)
                </Label>
                <PrismInput size="default" />
              </TextField>
            </div>
          </GalleryItem>

          <GalleryItem label="Campos Especializados (TimeField e ColorField)">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Horário (sm · h-8 / 32px)
                </Label>
                <PrismTimeField aria-label="Horário sm" size="sm" />
              </div>
              <div>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Horário (default · h-10 / 40px)
                </Label>
                <PrismTimeField aria-label="Horário default" size="default" />
              </div>
              <div>
                <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                  Cor Hex (sm · h-8 / 32px)
                </Label>
                <PrismColorField
                  aria-label="Cor sm"
                  defaultValue="#FF5733"
                  size="sm"
                />
              </div>
              <div>
                <Label className="mb-1.5 block cursor-pointer text-sm font-medium text-foreground">
                  Cor Hex (default · h-10 / 40px)
                </Label>
                <PrismColorField
                  aria-label="Cor default"
                  defaultValue="#FF5733"
                  size="default"
                />
              </div>
            </div>

            <div className="mt-4 flex max-w-sm flex-col gap-2">
              <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <span>ColorArea & ColorSlider</span>
                <span
                  className="inline-flex size-5 items-center justify-center rounded-full bg-green-400 text-green-950 shadow-xs ring-2 ring-green-400/50"
                  title="Aprovado"
                >
                  <CheckIcon className="size-3.5 stroke-[3]" />
                </span>
              </Label>
              <PrismColorArea defaultValue="#FF5733" />
              <PrismColorSlider defaultValue="#FF5733" />
            </div>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
