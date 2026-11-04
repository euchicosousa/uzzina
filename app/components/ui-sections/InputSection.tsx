import { useState } from "react";
import { TextField, Label, parseColor } from "react-aria-components";
import { EyeIcon, EyeOffIcon, SearchIcon, XIcon } from "lucide-react";
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
import {
  PropsPlayground,
  PlaygroundSelect,
  PlaygroundRadio,
  PlaygroundBoolean,
  PlaygroundText,
} from "./PropsPlayground";

const INPUT_SIZES = ["sm", "default", "lg"] as const;
type InputSize = (typeof INPUT_SIZES)[number];

const INPUT_TYPES = ["text", "email", "password"] as const;
type InputType = (typeof INPUT_TYPES)[number];

function InputPlayground() {
  const [size, setSize] = useState<InputSize>("default");
  const [type, setType] = useState<InputType>("text");
  const [disabled, setDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);
  const [hasLabel, setHasLabel] = useState(true);
  const [compareButton, setCompareButton] = useState(false);
  const [placeholder, setPlaceholder] = useState("Digite aqui...");
  const [value, setValue] = useState("");

  return (
    <PropsPlayground
      caption={`size="${size}" · type="${type}"`}
      preview={
        <div className="flex w-full max-w-sm items-end gap-3">
          <TextField
            className="flex-1"
            isDisabled={disabled}
            isInvalid={isInvalid}
            onChange={setValue}
            value={value}
          >
            {hasLabel && (
              <Label className="mb-1.5 block cursor-pointer text-xs font-medium text-foreground">
                Exemplo de Rótulo
              </Label>
            )}
            <PrismInput placeholder={placeholder} size={size} type={type} />
          </TextField>
          {compareButton && (
            <PrismButton size={size} variant="default">
              Botão
            </PrismButton>
          )}
        </div>
      }
      title="Input"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={INPUT_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Tipo"
        onChange={setType}
        options={INPUT_TYPES}
        prop="type"
        value={type}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setDisabled}
        prop="disabled"
        value={disabled}
      />
      <PlaygroundBoolean
        label="Inválido"
        onChange={setIsInvalid}
        prop="isInvalid"
        value={isInvalid}
      />
      <PlaygroundBoolean
        label="Com rótulo"
        onChange={setHasLabel}
        prop="Label"
        value={hasLabel}
      />
      <PlaygroundBoolean
        label="Comparar com botão"
        onChange={setCompareButton}
        prop="compareButton"
        value={compareButton}
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

const PREFIX_OPTIONS = ["none", "icon", "text"] as const;
type PrefixOption = (typeof PREFIX_OPTIONS)[number];
const PREFIX_LABELS: Record<PrefixOption, string> = {
  none: "Nenhum",
  icon: "Ícone",
  text: "Texto",
};

const SUFFIX_OPTIONS = ["none", "kbd", "clear", "password"] as const;
type SuffixOption = (typeof SUFFIX_OPTIONS)[number];
const SUFFIX_LABELS: Record<SuffixOption, string> = {
  none: "Nenhum",
  kbd: "Atalho",
  clear: "Limpar",
  password: "Mostrar senha",
};

function InputGroupPlayground() {
  const [size, setSize] = useState<InputSize>("default");
  const [prefix, setPrefix] = useState<PrefixOption>("icon");
  const [suffix, setSuffix] = useState<SuffixOption>("none");
  const [isDisabled, setIsDisabled] = useState(false);
  const [text, setText] = useState("UZZINA");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <PropsPlayground
      caption={`size="${size}" · prefix="${prefix}" · suffix="${suffix}"`}
      preview={
        <div className="w-full max-w-sm">
          <PrismInputGroup isDisabled={isDisabled} size={size}>
            {prefix === "icon" && (
              <PrismInputGroupAddon align="inline-start">
                <SearchIcon />
              </PrismInputGroupAddon>
            )}
            {prefix === "text" && (
              <PrismInputGroupAddon align="inline-start">
                <PrismInputGroupText>https://</PrismInputGroupText>
              </PrismInputGroupAddon>
            )}
            <PrismInputGroupInput
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite algo..."
              type={
                suffix === "password" && showPassword
                  ? "text"
                  : suffix === "password"
                    ? "password"
                    : "text"
              }
              value={text}
            />
            {suffix === "kbd" && (
              <PrismInputGroupAddon align="inline-end">
                <PrismKbd>⌘K</PrismKbd>
              </PrismInputGroupAddon>
            )}
            {suffix === "clear" && (
              <PrismInputGroupAddon align="inline-end">
                <PrismInputGroupButton
                  aria-label="Limpar busca"
                  onPress={() => setText("")}
                >
                  <XIcon />
                </PrismInputGroupButton>
              </PrismInputGroupAddon>
            )}
            {suffix === "password" && (
              <PrismInputGroupAddon align="inline-end">
                <PrismInputGroupButton
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </PrismInputGroupButton>
              </PrismInputGroupAddon>
            )}
          </PrismInputGroup>
        </div>
      }
      title="InputGroup"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={INPUT_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundRadio
        label="Prefixo"
        onChange={setPrefix}
        optionLabels={PREFIX_LABELS}
        options={PREFIX_OPTIONS}
        prop='align="inline-start"'
        value={prefix}
      />
      <PlaygroundSelect
        label="Sufixo"
        onChange={setSuffix}
        optionLabels={SUFFIX_LABELS}
        options={SUFFIX_OPTIONS}
        prop='align="inline-end"'
        value={suffix}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
    </PropsPlayground>
  );
}

function TimeFieldPlayground() {
  const [size, setSize] = useState<InputSize>("default");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <PropsPlayground
      caption={`size="${size}"`}
      preview={
        <div className="w-48">
          <PrismTimeField
            aria-label="Horário"
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            size={size}
          />
        </div>
      }
      title="TimeField"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={INPUT_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Inválido"
        onChange={setIsInvalid}
        prop="isInvalid"
        value={isInvalid}
      />
    </PropsPlayground>
  );
}

function ColorFieldPlayground() {
  const [size, setSize] = useState<InputSize>("default");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  return (
    <PropsPlayground
      caption={`size="${size}" · defaultValue="#FF5733"`}
      preview={
        <div className="w-48">
          <PrismColorField
            aria-label="Cor"
            defaultValue="#FF5733"
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            size={size}
          />
        </div>
      }
      title="ColorField"
    >
      <PlaygroundRadio
        label="Tamanho"
        onChange={setSize}
        options={INPUT_SIZES}
        prop="size"
        value={size}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
      <PlaygroundBoolean
        label="Inválido"
        onChange={setIsInvalid}
        prop="isInvalid"
        value={isInvalid}
      />
    </PropsPlayground>
  );
}

const COLOR_CHANNELS = ["hue", "saturation", "lightness", "alpha"] as const;
type ColorChannelOption = (typeof COLOR_CHANNELS)[number];

function ColorPickerPlayground() {
  const [channel, setChannel] = useState<ColorChannelOption>("hue");
  const [isDisabled, setIsDisabled] = useState(false);
  const [color, setColor] = useState(() => parseColor("#FF5733"));

  const hslColor = color.toFormat("hsl");

  return (
    <PropsPlayground
      caption={color.toString("hex")}
      preview={
        <div className="flex w-full max-w-sm flex-col gap-2">
          <PrismColorArea
            isDisabled={isDisabled}
            onChange={setColor}
            value={color}
          />
          <PrismColorSlider
            channel={channel}
            colorSpace="hsl"
            isDisabled={isDisabled}
            onChange={(c) => c && setColor(c)}
            value={hslColor}
          />
        </div>
      }
      title="ColorArea e ColorSlider"
    >
      <PlaygroundSelect
        label="Canal do slider"
        onChange={setChannel}
        options={COLOR_CHANNELS}
        prop="channel"
        value={channel}
      />
      <PlaygroundBoolean
        label="Desabilitado"
        onChange={setIsDisabled}
        prop="isDisabled"
        value={isDisabled}
      />
    </PropsPlayground>
  );
}

export function InputSection() {
  return (
    <div id="prism-input">
      <GallerySection>
        <GallerySectionHeader
          approved
          description="Campos de entrada de texto e grupos acoplados (Input e InputGroup) com alinhamento visual rigoroso aos botões em todos os tamanhos."
          title="Input"
        />
        <GallerySectionContent className="grid gap-12">
          <GalleryItem label="Input">
            <InputPlayground />
          </GalleryItem>
          <GalleryItem label="InputGroup">
            <InputGroupPlayground />
          </GalleryItem>
          <GalleryItem label="TimeField">
            <TimeFieldPlayground />
          </GalleryItem>
          <GalleryItem label="ColorField">
            <ColorFieldPlayground />
          </GalleryItem>
          <GalleryItem label="ColorArea e ColorSlider">
            <ColorPickerPlayground />
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
