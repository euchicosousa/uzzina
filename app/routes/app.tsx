import { lazy, Suspense, useEffect, useState } from "react";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Header } from "~/components/layout/Header";
import { getUserId } from "~/lib/helpers";
// import { CreateAndEditAction } from "./CreateAndEditAction";

import { Toaster } from "sonner";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { format } from "date-fns";

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
  celebrations: Celebration[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  // console.log(format(new Date().getHours() < 16 ? new Date().setHours(11, 0, 0) : new Date(), "yyyy-MM-dd HH:m:ss"))

  const [
    { data: people },
    { data: partners },
    { data: states },
    { data: categories },
    { data: priorities },
    { data: celebrations },
  ] = await Promise.all([
    supabase
      .from("people")
      .select("*")
      .eq("visible", true)
      .order("name", { ascending: true }),
    supabase
      .from("partners")
      .select("*")
      .eq("archived", false)
      .contains("users_ids", [user_id])
      .order("title", { ascending: true }),
    supabase.from("states").select("*").order("order", { ascending: true }),
    supabase.from("categories").select("*").order("order", { ascending: true }),
    supabase.from("priorities").select("*").order("order", { ascending: true }),
    supabase
      .from("celebrations")
      .select("*")
      .order("date", { ascending: true }),
  ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  invariant(person, "Person not found");
  invariant(people, "People not found");
  invariant(partners, "Partners not found");
  invariant(states, "States not found");
  invariant(categories, "Categories not found");
  invariant(priorities, "Priorities not found");
  invariant(celebrations, "Priorities not found");

  return {
    people,
    person,
    partners,
    states,
    categories,
    priorities,
    celebrations,
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
  const { person, partners } = useLoaderData<typeof loader>();
  const [BaseAction, setBaseAction] = useState<Action | null>(null);
  const [openCmdK, setOpenCmdK] = useState(false);

  useEffect(() => {
    function keyDown(event: KeyboardEvent) {
      if (event.key === "k" && event.metaKey) {
        setOpenCmdK(!openCmdK);
      }
    }
    document.addEventListener("keydown", keyDown);

    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  const navigate = useNavigate();

  return (
    <div id="app" className="flex h-screen flex-col">
      {/* HEADER */}

      <Header person={person} setBaseAction={setBaseAction} />
      <div className="flex h-full w-full overflow-hidden">
        <div className="custom-scrollbars grow overflow-x-hidden overflow-y-auto">
          <div className="flex min-h-full grow">
            {/* <div className="min-h-full w-8 shrink-0 border-r"></div> */}
            {/* <div className="flex min-h-full w-[calc(100%-4rem)] shrink flex-col"> */}
            <div className="flex min-h-full w-full shrink flex-col">
              <Outlet context={{ BaseAction, setBaseAction }} />
            </div>
            {/* <div className="min-h-full w-8 shrink-0 border-l"></div> */}
          </div>
        </div>
        <Toaster richColors />

        {BaseAction ? (
          <Suspense fallback={null}>
            <div
              className="fixed inset-0 top-17 z-10 flex w-full shrink-0 flex-col bg-black/20"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setBaseAction(null);
              }}
            ></div>
            <CreateAndEditAction
              BaseAction={BaseAction}
              onClose={() => setBaseAction(null)}
            />
          </Suspense>
        ) : null}
      </div>
      <Dialog open={openCmdK} onOpenChange={setOpenCmdK}>
        <DialogContent className="p-0">
          <Command>
            <CommandInput placeholder="Faça sua busca aqui" />
            <CommandList className="p-2 outline-none">
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              {partners.map((partner) => (
                <CommandItem
                  key={partner.id}
                  value={[partner.title, partner.slug].join("")}
                  onSelect={() => {
                    navigate(`/app/partner/${partner.slug}`);
                    setOpenCmdK(false);
                  }}
                >
                  {partner.title}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}
