import { ReactLenis } from "lenis/react";
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Header } from "~/components/layout/Header";
import { getUserId } from "~/lib/helpers";

export type AppLoaderData = {
  people: Person[];
  person: Person;
  partners: Partner[];
  states: State[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const [{ data: people }, { data: partners }, { data: states }] =
    await Promise.all([
      supabase.from("people").select("*").order("name", { ascending: true }),
      supabase
        .from("partners")
        .select("*")
        .eq("archived", false)
        .contains("users_ids", [user_id])
        .order("title", { ascending: true }),
      supabase.from("states").select("*").order("order", { ascending: true }),
    ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  invariant(person, "Person not found");
  invariant(people, "People not found");
  invariant(partners, "Partners not found");
  invariant(states, "States not found");

  return { people, person, partners, states } as AppLoaderData;
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

  return (
    <div id="app" className="flex h-screen flex-col">
      <Header person={person} />

      <ReactLenis className="flex h-full flex-col overflow-y-auto">
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
