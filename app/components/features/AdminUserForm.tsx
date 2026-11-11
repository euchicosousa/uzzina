import { useState } from "react";
import { UAvatarUpload } from "~/components/uzzina/UAvatarUpload";
import { EyeIcon, EyeOffIcon, SaveIcon } from "lucide-react";
import {
  PrismButton,
  PrismCheckbox,
  PrismInput,
  PrismInputGroup,
  PrismInputGroupAddon,
  PrismInputGroupButton,
  PrismInputGroupInput,
  PrismLabel,
  PrismToggleGroup,
  PrismToggleGroupItem,
} from "../prism";
interface Area {
  slug: string;
  title: string;
}
interface AdminUserFormProps {
  person: Person | null; // Tipagem básica para agilizar (idealmente seria importado do DB types ou loader)
  areas: Area[];
  cloudName: string;
  uploadPreset: string;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
export function AdminUserForm({
  person,
  areas,
  cloudName,
  uploadPreset,
  isSubmitting,
  onSubmit,
}: AdminUserFormProps) {
  const isNew = !person;
  const [showPassword, setShowPassword] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(
    person?.image || null,
  );
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    person?.areas || [],
  );
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      {/* URL da imagem já enviada pelo widget — campo oculto */}
      <input name="image" type="hidden" value={imageUrl || ""} />

      <div className="grid gap-8">
        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <UAvatarUpload
            aria-label="Alterar foto"
            cloudName={cloudName}
            fallback={person?.initials || "?"}
            folder="uzzina/people"
            image={imageUrl}
            onUpload={setImageUrl}
            uploadPreset={uploadPreset}
          />

          <div className="grid gap-1">
            <p className="font-medium">Foto de Perfil</p>
            <p className="text-sm text-secondary-foreground">
              Clique para fazer upload e recortar
            </p>
            {imageUrl && (
              <PrismButton
                onPress={() => setImageUrl(null)}
                size="xs"
                variant="link"
              >
                Remover imagem
              </PrismButton>
            )}
          </div>
        </div>

        {/* Nome e Sobrenome */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <PrismLabel htmlFor="name">Nome</PrismLabel>
            <PrismInput
              defaultValue={person?.name}
              id="name"
              name="name"
              required
            />
          </div>
          <div className="grid gap-4">
            <PrismLabel htmlFor="surname">Sobrenome</PrismLabel>
            <PrismInput
              defaultValue={person?.surname}
              id="surname"
              name="surname"
              required
            />
          </div>
        </div>

        {/* Iniciais e Nome Curto */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <PrismLabel htmlFor="initials">Iniciais</PrismLabel>
            <PrismInput
              defaultValue={person?.initials}
              id="initials"
              maxLength={2}
              name="initials"
              placeholder="AB"
              required
            />
          </div>
          <div className="grid gap-4">
            <PrismLabel htmlFor="short">Nome Curto</PrismLabel>
            <PrismInput
              defaultValue={person?.short || ""}
              id="short"
              name="short"
              placeholder="Como te chamam"
            />
          </div>
        </div>

        {/* Email */}
        <div className="grid gap-4">
          <PrismLabel htmlFor="email">E-mail</PrismLabel>
          <PrismInput
            defaultValue={person?.email || ""}
            id="email"
            name="email"
            required
            type="email"
          />
          {!isNew && (
            <p className="text-xs text-secondary-foreground">
              Nota: Alterar o email aqui não altera o login, apenas o perfil.
            </p>
          )}
        </div>

        {/* Senha (apenas criação) */}
        {isNew && (
          <div className="grid gap-4">
            <PrismLabel htmlFor="password">Senha Provisória</PrismLabel>
            <PrismInputGroup>
              <PrismInputGroupInput
                id="password"
                minLength={6}
                name="password"
                required
                type={showPassword ? "text" : "password"}
              />
              <PrismInputGroupAddon align="inline-end" className="pr-2 pl-1">
                <PrismInputGroupButton
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </PrismInputGroupButton>
              </PrismInputGroupAddon>
            </PrismInputGroup>
          </div>
        )}

        {/* Áreas */}
        {areas.length > 0 && (
          <div className="grid gap-4">
            <span className="font-medium">Áreas</span>
            <PrismToggleGroup
              aria-label="Áreas de atuação"
              selectedKeys={selectedAreas}
              onSelectionChange={(keys) =>
                setSelectedAreas(Array.from(keys) as string[])
              }
              selectionMode="multiple"
            >
              {areas.map((area) => (
                <PrismToggleGroupItem id={area.slug} key={area.slug}>
                  {area.title}
                </PrismToggleGroupItem>
              ))}
            </PrismToggleGroup>
            {/* Input oculto para submissão nativa do form com nome 'areas' */}
            {selectedAreas.map((areaSlug) => (
              <input
                key={areaSlug}
                name="areas"
                type="hidden"
                value={areaSlug}
              />
            ))}
          </div>
        )}

        {/* Visibilidade e Admin */}
        <div className="flex items-center gap-6 border-t pt-6">
          <PrismCheckbox
            defaultSelected={person?.visible ?? true}
            name="visible"
            value="on"
          >
            Ativo / Visível
          </PrismCheckbox>

          <PrismCheckbox
            defaultSelected={person?.admin ?? false}
            name="admin"
            value="on"
          >
            Admin
          </PrismCheckbox>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-8">
        <PrismButton isDisabled={isSubmitting} type="submit">
          {isSubmitting ? "Salvando..." : "Salvar Usuário"}
          <SaveIcon className="size-4" />
        </PrismButton>
      </div>
    </form>
  );
}
