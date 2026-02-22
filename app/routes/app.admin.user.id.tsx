import { createClient } from "@supabase/supabase-js";
import {
  Link,
  redirect,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import type { Database } from "types/database";
import { AdminUserForm } from "~/components/features/AdminUserForm";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Admin | Editar Usuário" }];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const { user_id } = params;

  const { data: areas } = await supabase
    .from("areas")
    .select("id, slug, title")
    .order("order");

  // Passamos cloud_name e upload_preset ao cliente (são públicos — sem risco)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET!;

  if (user_id === "new") {
    return { person: null, areas: areas ?? [], cloudName, uploadPreset };
  }

  const { data: person } = await supabase
    .from("people")
    .select("*")
    .eq("user_id", user_id!)
    .single();

  return { person, areas: areas ?? [], cloudName, uploadPreset };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { supabase } = await getUserId(request);
  const formData = await request.formData();

  const supabaseAdmin = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { user_id } = params;

  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const initials = formData.get("initials") as string;
  const short = formData.get("short") as string;
  const admin = formData.get("admin") === "on";
  const visible = formData.get("visible") === "on";
  const areas = formData.getAll("areas") as string[];
  // URL vinda diretamente do Cloudinary Upload Widget (já enviada pelo widget)
  const image = (formData.get("image") as string) || null;

  if (user_id === "new") {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      console.error("Auth Create Error:", authError);
      throw new Response(authError.message, { status: 400 });
    }

    if (!authUser.user) {
      throw new Response("Failed to create user", { status: 500 });
    }

    const { error: dbError } = await supabase.from("people").insert({
      user_id: authUser.user.id,
      name,
      surname,
      email,
      initials,
      short: short || name,
      image,
      admin,
      visible,
      areas,
    });

    if (dbError) {
      console.error("DB Insert Error:", dbError);
      throw new Response(dbError.message, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("people")
      .update({
        name,
        surname,
        email,
        initials,
        short,
        image,
        admin,
        visible,
        areas,
      })
      .eq("user_id", user_id!);

    if (error) {
      return { error: error.message };
    }
  }

  return redirect("/app/admin/users");
};

export default function AdminUserPage() {
  const { person, areas, cloudName, uploadPreset } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const isNew = !person;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col p-8">
      <div className="mb-16 flex items-center justify-between gap-8">
        <h1 className="pb-0 text-2xl font-bold">
          {isNew ? "Novo Usuário" : `Editar ${person.name}`}
        </h1>
        <Link to="/app/admin/users" className="font-medium hover:underline">
          Voltar
        </Link>
      </div>

      <AdminUserForm
        person={person}
        areas={areas}
        cloudName={cloudName}
        uploadPreset={uploadPreset}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
