import { useState } from "react";
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { SegmentedSelector } from "~/components/uzzina/SegmentedSelector";
import {
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";
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
}
export function AdminUserForm({
  person,
  areas,
  cloudName,
  uploadPreset,
  isSubmitting,
}: AdminUserFormProps) {
  const isNew = !person;
  const [showPassword, setShowPassword] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(
    person?.image || null,
  );
  return (
    <Form className="flex flex-col gap-8" method="post">
      {/* URL da imagem já enviada pelo widget — campo oculto */}
      <input name="image" type="hidden" value={imageUrl || ""} />

      <div className="grid gap-8">
        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <CloudinaryUpload
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition hover:opacity-90"
            cloudName={cloudName}
            folder="uzzina/people"
            onUpload={(url) => setImageUrl(url)}
            outputWidth={400}
            square
            uploadPreset={uploadPreset}
          >
            <UAvatar
              key={imageUrl ?? "empty"}
              fallback={person?.initials || "?"}
              image={imageUrl}
              size="2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadIcon className="size-6 text-white" />
            </div>
          </CloudinaryUpload>

          <div className="grid gap-1">
            <p className="font-medium">Foto de Perfil</p>
            <p className="text-sm text-muted-foreground">
              Clique para fazer upload e recortar
            </p>
            {imageUrl && (
              <button
                className="mt-1 text-left text-xs text-muted-foreground underline hover:text-foreground"
                onClick={() => setImageUrl(null)}
                type="button"
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        {/* Nome e Sobrenome */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="name">
              Nome
            </label>
            <Input
              defaultValue={person?.name}
              id="name"
              name="name"
              required
              variant="inset"
            />
          </div>
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="surname">
              Sobrenome
            </label>
            <Input
              defaultValue={person?.surname}
              id="surname"
              name="surname"
              required
              variant="inset"
            />
          </div>
        </div>

        {/* Iniciais e Nome Curto */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="initials">
              Iniciais
            </label>
            <Input
              defaultValue={person?.initials}
              id="initials"
              maxLength={2}
              name="initials"
              placeholder="AB"
              required
              variant="inset"
            />
          </div>
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="short">
              Nome Curto
            </label>
            <Input
              defaultValue={person?.short || ""}
              id="short"
              name="short"
              placeholder="Como te chamam"
              variant="inset"
            />
          </div>
        </div>

        {/* Email */}
        <div className="grid gap-4">
          <label className="font-medium" htmlFor="email">
            E-mail
          </label>
          <Input
            defaultValue={person?.email || ""}
            id="email"
            name="email"
            required
            type="email"
            variant="inset"
          />
          {!isNew && (
            <p className="text-xs text-muted-foreground">
              Nota: Alterar o email aqui não altera o login, apenas o perfil.
            </p>
          )}
        </div>

        {/* Senha (apenas criação) */}
        {isNew && (
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="password">
              Senha Provisória
            </label>
            <div className="relative">
              <Input
                className="pr-10"
                id="password"
                minLength={6}
                name="password"
                required
                type={showPassword ? "text" : "password"}
                variant="inset"
              />
              <button
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Áreas */}
        {areas.length > 0 && (
          <div className="grid gap-4">
            <span className="font-medium">Áreas</span>
            <SegmentedSelector
              columnsClassName="grid-cols-2 sm:grid-cols-4 gap-2"
              defaultValue={person?.areas || []}
              name="areas"
              options={areas.map((area) => ({
                value: area.slug,
                label: area.title,
              }))}
            />
          </div>
        )}

        {/* Visibilidade e Admin */}
        <div className="flex items-end justify-between gap-4 border-t pt-8">
          <div className="flex items-center gap-4">
            <SegmentedSelector
              className="p-6"
              columns={1}
              defaultValue={(person?.visible ?? true) ? ["on"] : []}
              name="visible"
              options={[
                {
                  value: "on",
                  label: "Ativo / Visível",
                  icon: person?.visible ? EyeIcon : EyeOffIcon,
                },
              ]}
              type="checkbox"
            />

            <SegmentedSelector
              className="p-6"
              columns={1}
              defaultValue={person?.admin ? ["on"] : []}
              name="admin"
              options={[
                {
                  value: "on",
                  label: "Admin",
                  icon: UserIcon,
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-8">
        <Button
          className="squircle rounded-2xl"
          disabled={isSubmitting}
          type="submit"
        >
          <SaveIcon className="mr-2 size-4" />
          {isSubmitting ? "Salvando..." : "Salvar Usuário"}
        </Button>
      </div>
    </Form>
  );
}
