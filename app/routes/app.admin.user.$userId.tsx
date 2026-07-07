
import { Link, useParams, useNavigate, type MetaFunction } from "react-router";
import { AdminUserForm } from "~/components/features/AdminUserForm";
import { AREAS } from "~/lib/CONSTANTS";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSupabaseBrowserClient } from "~/lib/supabase.client";
import { toast } from "sonner";
import type { Person } from "~/types";
import { useAppContext } from "~/contexts/AppContext";

export const meta: MetaFunction = () => [{ title: "Admin | Editar Usuário" }];

interface UserFormData {
  name: string;
  surname: string;
  email: string;
  password?: string;
  initials: string;
  short: string;
  image: string | null;
  admin: boolean;
  visible: boolean;
  areas: string[];
}

export default function AdminUserPage() {
  const params = useParams();
  const userId = params.userId || params.user_id;
  const navigate = useNavigate();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const areas = Object.values(AREAS);

  const isNew = userId === "new" || !userId;

  // Query do Membro
  const { data: person, isLoading: isLoadingPerson } = useQuery({
    queryKey: ["person", userId],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("people")
        .select("*")
        .eq("user_id", userId || "")
        .single();
      if (error) throw error;
      return data as Person;
    },
    enabled: !!userId,
  });

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      if (isNew) {
        // 1. Obter token de acesso do admin logado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Você não está autenticado.");

        // 2. Chamar a API Serverless para criar o usuário Auth com segurança
        const res = await fetch("/api/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            name: userData.name,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || "Falha ao criar credenciais do usuário.");
        }

        const newAuthId = resData.user.id;

        // 3. Inserir na tabela "people"
        const { error: dbError } = await supabase.from("people").insert({
          user_id: newAuthId,
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          initials: userData.initials,
          short: userData.short || userData.name,
          image: userData.image,
          admin: userData.admin,
          visible: userData.visible,
          areas: userData.areas,
        });

        if (dbError) throw dbError;
      } else {
        const { error } = await supabase
          .from("people")
          .update({
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            initials: userData.initials,
            short: userData.short,
            image: userData.image,
            admin: userData.admin,
            visible: userData.visible,
            areas: userData.areas,
          })
          .eq("user_id", userId || "");

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["person", userId] });
      queryClient.invalidateQueries({ queryKey: ["people"] });
      toast.success("Membro salvo com sucesso!");
      navigate("/app/admin/users");
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao salvar: ${message}`);
    },
  });

  const isSubmitting = saveMutation.isPending;
  const appData = useAppContext();
  const { cloudName, uploadPreset } = appData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const initials = formData.get("initials") as string;
    const short = formData.get("short") as string;
    const admin = formData.get("admin") === "on";
    const visible = formData.get("visible") === "on";
    const userAreas = formData.getAll("areas") as string[];
    const image = (formData.get("image") as string) || null;

    await saveMutation.mutateAsync({
      name,
      surname,
      email,
      password,
      initials,
      short: short || name,
      image,
      admin,
      visible,
      areas: userAreas,
    });
  };

  if (isLoadingPerson) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background gap-4">
        <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Carregando membro...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-8">
      <div className="mb-16 flex items-center justify-between gap-8">
        <h1 className="pb-0 text-2xl font-bold">
          {isNew ? "Novo Usuário" : `Editar ${person?.name || ""}`}
        </h1>
        <Link to="/app/admin/users" className="font-medium hover:underline">
          Voltar
        </Link>
      </div>

      <AdminUserForm
        person={person || null}
        areas={areas}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
