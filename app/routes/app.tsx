import { ReactLenis, useLenis } from "lenis/react";
import {
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Header } from "~/components/layout/Header";
import { createSupabaseClient } from "~/lib/supabase";

export type AppLoaderData = {
  people: Person[];
  person: Person;
  partners: Partner[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await createSupabaseClient(request);

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return redirect("/login");
  }

  const user_id = data.claims.sub;

  const [{ data: people }, { data: partners }] = await Promise.all([
    supabase.from("people").select("*").order("name", { ascending: true }),
    supabase
      .from("partners")
      .select("*")
      .eq("archived", false)
      .contains("users_ids", [user_id])
      .order("title", { ascending: true }),
  ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  invariant(person, "Person not found");
  invariant(people, "People not found");
  invariant(partners, "Partners not found");

  return { people, person, partners } as AppLoaderData;
};

export const meta: MetaFunction = () => {
  return [
    { title: "ᴜᴢᴢɪɴa - Domine, Crie e Conquiste." },
    {
      name: "description",
      content:
        "Aplicativo de Gestão de Projetos Criado e Mantido pela Agência CNVT®. ",
    },
  ];
};

export default function Dashboard() {
  const { person } = useLoaderData<typeof loader>();
  const lenis = useLenis();

  return (
    <div id="app" className="flex h-screen flex-col">
      <Header person={person} />

      <ReactLenis className="flex h-full overflow-y-auto">
        <div className="flex h-full">
          <div className="h-full min-w-8 border-r"></div>
          <div className="flex h-full w-full shrink flex-col">
            {/* HEADER */}
            <div className="">
              <Outlet />
            </div>
          </div>
          <div className="h-full min-w-8 border-l"></div>
        </div>
      </ReactLenis>
    </div>
  );
}
