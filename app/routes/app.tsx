import { lazy, Suspense, useState } from "react";
import {
  Outlet,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Header } from "~/components/layout/Header";
import { getUserId } from "~/lib/helpers";
// import { CreateAndEditAction } from "./CreateAndEditAction";
import { AnimatePresence } from "motion/react";
import { Toaster } from "sonner";

const CreateAndEditAction = lazy(() =>
  import("./CreateAndEditAction").then((module) => ({
    default: module.CreateAndEditAction,
  })),
);

export type AppLoaderData = {
  people: Person[];
  person: Person;
  partners: Partner[];
  states: State[];
  categories: Category[];
  priorities: Priority[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const [
    { data: people },
    { data: partners },
    { data: states },
    { data: categories },
    { data: priorities },
  ] = await Promise.all([
    supabase.from("people").select("*").order("name", { ascending: true }),
    supabase
      .from("partners")
      .select("*")
      .eq("archived", false)
      .contains("users_ids", [user_id])
      .order("title", { ascending: true }),
    supabase.from("states").select("*").order("order", { ascending: true }),
    supabase.from("categories").select("*").order("order", { ascending: true }),
    supabase.from("priorities").select("*").order("order", { ascending: true }),
  ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  invariant(person, "Person not found");
  invariant(people, "People not found");
  invariant(partners, "Partners not found");
  invariant(states, "States not found");
  invariant(categories, "Categories not found");
  invariant(priorities, "Priorities not found");

  return {
    people,
    person,
    partners,
    states,
    categories,
    priorities,
  } as AppLoaderData;
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
  const [BaseAction, setBaseAction] = useState<Action | null>(null);

  return (
    <div id="app" className="flex h-screen flex-col">
      {/* HEADER */}

      <Header person={person} setBaseAction={setBaseAction} />
      <div className="flex h-full w-full overflow-hidden">
        <div className="custom-scrollbars grow overflow-x-hidden overflow-y-auto">
          <div className="flex min-h-full grow">
            <div className="min-h-full w-8 shrink-0 border-r"></div>
            <div className="flex min-h-full w-[calc(100%-4rem)] shrink flex-col">
              <Outlet context={{ BaseAction, setBaseAction }} />
            </div>
            <div className="min-h-full w-8 shrink-0 border-l"></div>
          </div>
        </div>
        <Toaster richColors />
        <AnimatePresence>
          {BaseAction ? (
            <Suspense fallback={null}>
              <CreateAndEditAction
                BaseAction={BaseAction}
                onClose={() => setBaseAction(null)}
              />
            </Suspense>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
