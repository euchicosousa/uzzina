import { useState } from "react";
import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import {
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  UploadIcon,
  UserIcon,
} from "lucide-react";

interface Area {
  id: string;
  slug: string;
  title: string;
}

interface AdminUserFormProps {
  person: any | null; // Tipagem básica para agilizar (idealmente seria importado do DB types ou loader)
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
    <Form method="post" className="flex flex-col gap-8">
      {/* URL da imagem já enviada pelo widget — campo oculto */}
      <input type="hidden" name="image" value={imageUrl || ""} />

      <div className="grid gap-8">
        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <CloudinaryUpload
            cloudName={cloudName}
            uploadPreset={uploadPreset}
            folder="uzzina/people"
            square
            outputWidth={400}
            onUpload={(url) => setImageUrl(url)}
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition hover:opacity-90"
          >
            <UAvatar
              key={imageUrl ?? "empty"}
              image={imageUrl}
              fallback={person?.initials || "?"}
              size="2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <UploadIcon className="size-6 text-white" />
            </div>
          </CloudinaryUpload>

          <div className="grid gap-1">
            <p className="font-medium">Foto de Perfil</p>
            <p className="text-muted-foreground text-sm">
              Clique para fazer upload e recortar
            </p>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="text-muted-foreground hover:text-foreground mt-1 text-left text-xs underline"
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
            <Input id="name" name="name" defaultValue={person?.name} required />
          </div>
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="surname">
              Sobrenome
            </label>
            <Input
              id="surname"
              name="surname"
              defaultValue={person?.surname}
              required
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
              id="initials"
              name="initials"
              defaultValue={person?.initials}
              required
              maxLength={2}
              placeholder="AB"
            />
          </div>
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="short">
              Nome Curto
            </label>
            <Input
              id="short"
              name="short"
              defaultValue={person?.short || ""}
              placeholder="Como te chamam"
            />
          </div>
        </div>

        {/* Email */}
        <div className="grid gap-4">
          <label className="font-medium" htmlFor="email">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={person?.email || ""}
            required
          />
          {!isNew && (
            <p className="text-muted-foreground text-xs">
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
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
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
            <label className="font-medium">Áreas</label>
            <div className="flex flex-wrap items-center gap-2">
              {areas.map((area) => (
                <div key={area.slug}>
                  <input
                    type="checkbox"
                    id={`area-${area.slug}`}
                    name="areas"
                    value={area.slug}
                    defaultChecked={person?.areas?.includes(area.slug)}
                    className="peer sr-only absolute size-0"
                  />
                  <label
                    htmlFor={`area-${area.slug}`}
                    className="peer-checked:bg-muted squircle flex cursor-pointer items-center gap-2 rounded-2xl border-transparent bg-transparent p-4 font-semibold opacity-50 transition-all peer-checked:opacity-100"
                  >
                    {area.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visibilidade e Admin */}
        <div className="flex items-end justify-between gap-4 border-t pt-8">
          <div className="flex items-center gap-4">
            <div>
              <input
                type="checkbox"
                id="visible"
                name="visible"
                defaultChecked={person?.visible ?? true}
                className="peer sr-only absolute size-0"
              />
              <label
                htmlFor="visible"
                className="peer-checked:bg-muted squircle flex cursor-pointer items-center gap-2 rounded-2xl border-transparent bg-transparent p-4 font-semibold opacity-50 transition-all peer-checked:opacity-100"
              >
                Ativo / Visível
              </label>
            </div>

            <div>
              <input
                type="checkbox"
                id="admin"
                name="admin"
                defaultChecked={person?.admin || false}
                className="peer sr-only absolute size-0"
              />
              <label
                htmlFor="admin"
                className="peer-checked:bg-muted squircle flex cursor-pointer items-center gap-2 rounded-2xl border-transparent bg-transparent p-4 font-semibold opacity-50 transition-all peer-checked:opacity-100"
              >
                <UserIcon className="size-4" />
                Admin
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pb-8">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="squircle rounded-2xl"
        >
          <SaveIcon className="mr-2 size-4" />
          {isSubmitting ? "Salvando..." : "Salvar Usuário"}
        </Button>
      </div>
    </Form>
  );
}
