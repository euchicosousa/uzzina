import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { UzzinaLogo } from "~/components/logo";
import { createSupabaseClient } from "~/lib/supabase";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createSupabaseClient(request);

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return redirect("/login");
  }

  const user_id = data.claims.sub;

  const [{ data: people }] = await Promise.all([
    supabase.from("people").select("*"),
  ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  return { people, person };
};

export const meta: MetaFunction = () => {
  return [
    { title: "UZZINA - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function Dashboard() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="border_after relative flex items-center p-4">
        <UzzinaLogo className="h-8" />
      </div>
      {/* HEADER */}
      {/* BODY */}
    </div>
  );
}
