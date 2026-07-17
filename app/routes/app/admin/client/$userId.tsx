import { UploadIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "~/components/ui/input-group";
import { CloudinaryUpload } from "~/components/uzzina/CloudinaryUpload";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UAvatarSelector } from "~/components/uzzina/UAvatarSelector";
import {
  archiveClient,
  createClient,
  getClientById,
  updateClient,
} from "~/models/clients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppContext } from "~/contexts/AppContext";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import type { Client } from "~/types";
export const Route = createFileRoute("/app/admin/client/$userId")({
  component: AdminClientPage,
});
function AdminClientPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const appData = useAppContext();
  const { partners } = appData;
  const isNew = userId === "new" || !userId;

  // Query do Cliente
  const { data: client } = useQuery({
    queryKey: ["client", userId],
    queryFn: async () => {
      if (isNew) return null;
      return getClientById(supabase, userId || "");
    },
    enabled: !!userId,
  });

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: async (
      clientData: Omit<Client, "id" | "created_at" | "active">,
    ) => {
      if (isNew) {
        await createClient(supabase, clientData);
      } else {
        await updateClient(supabase, userId || "", clientData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      toast.success("Cliente salvo com sucesso!");
      navigate({
        to: "/app/admin/clients",
      });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao salvar: ${message}`);
    },
  });

  // Mutation para arquivar
  const archiveMutation = useMutation({
    mutationFn: async () => {
      await archiveClient(supabase, userId || "");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });
      toast.success("Cliente arquivado com sucesso!");
      navigate({
        to: "/app/admin/clients",
      });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao arquivar: ${message}`);
    },
  });
  const isSubmitting = saveMutation.isPending || archiveMutation.isPending;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Sincroniza imagem quando o cliente carregar
  useEffect(() => {
    if (client) {
      setImageUrl(client.image || null);
    }
  }, [client]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const partnerSlugs = formData.getAll("partner_slugs") as string[];
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    await saveMutation.mutateAsync({
      name,
      email,
      password,
      image: imageUrl,
      partners: partnerSlugs,
    });
  };
  return (
    <div
      key={client?.id || "new"}
      className="mx-auto flex h-full w-full max-w-3xl flex-col p-8"
    >
      <div className="mb-8 flex items-center justify-between gap-8">
        <h1 className="pb-0 text-2xl font-bold">
          {isNew ? "Novo Cliente" : `Editar ${client?.name || ""}`}
        </h1>
        <Link className="font-medium hover:underline" to="/app/admin/clients">
          Voltar
        </Link>
      </div>

      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <input name="image" type="hidden" value={imageUrl || ""} />

        {/* Avatar / UploadIcon Widget */}
        <div className="flex items-center gap-6">
          <CloudinaryUpload
            className="group relative -ml-1 size-24 shrink-0 overflow-hidden rounded-full transition hover:opacity-90"
            cloudName={appData.cloudName}
            folder="uzzina/clients"
            onUpload={(url: string) => setImageUrl(url)}
            outputWidth={400}
            square
            uploadPreset={appData.uploadPreset}
          >
            <UAvatar
              key={imageUrl ?? "empty"}
              fallback={client?.name || "?"}
              image={imageUrl}
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
                className="text-muted-foreground hover:text-foreground mt-1 text-left text-xs underline"
                onClick={() => setImageUrl(null)}
                type="button"
              >
                Remover imagem
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          <label className="font-medium" htmlFor="name">
            Nome
          </label>
          <Input
            defaultValue={client?.name || ""}
            id="name"
            name="name"
            placeholder="Nome do cliente"
            required
            variant="inset"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <label className="font-medium" htmlFor="email">
              E-mail
            </label>
            <Input
              defaultValue={client?.email || ""}
              id="email"
              name="email"
              placeholder="cliente@empresa.com"
              required
              type="email"
              variant="inset"
            />
          </div>

          <div className="grid gap-4">
            <label className="font-medium" htmlFor="password">
              Senha
            </label>
            <InputGroup>
              <InputGroupInput
                defaultValue={client?.password || ""}
                id="password"
                name="password"
                placeholder="Senha de acesso"
                required
                type={showPassword ? "text" : "password"}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="font-medium">Partners com acesso</div>
          <UAvatarSelector
            initialSelectedIds={client?.partners || []}
            name="partner_slugs"
            options={partners
              .filter((p) => !p.archived)
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((p) => ({
                id: p.slug,
                fallback: p.short,
                image: p.image,
                backgroundColor: p.colors[0],
                color: p.colors[1],
                title: p.title,
              }))}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t pt-6">
          {!isNew && (
            <div className="flex gap-2">
              <Button
                className="squircle bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-2xl"
                disabled={isSubmitting}
                onClick={() => {
                  if (confirm("Tem certeza que deseja ocultar este cliente?")) {
                    archiveMutation.mutate();
                  }
                }}
                type="button"
                variant="destructive"
              >
                Arquivar Cliente
              </Button>
            </div>
          )}
          <Button
            className="squircle ml-auto rounded-2xl"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Salvando..." : isNew ? "Criar Cliente" : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
