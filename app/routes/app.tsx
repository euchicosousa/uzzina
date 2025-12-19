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
import { getCleanAction, getUserId } from "~/lib/helpers";

import { Toaster } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Dialog, DialogContent } from "~/components/ui/dialog";

const CreateAndEditAction = lazy(() =>
  import("./CreateAndEditAction").then((module) => ({
    default: module.CreateAndEditAction,
  })),
);

export type AppLoaderData = {
  people: Person[];
  person: Person;
  partners: Partner[];
  celebrations: Celebration[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const [{ data: people }, { data: partners }, { data: celebrations }] =
    await Promise.all([
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
      supabase
        .from("celebrations")
        .select("*")
        .order("date", { ascending: true }),
    ]);

  const person = people?.find((person) => person.user_id === user_id)!;

  invariant(person, "Person not found");
  invariant(people, "People not found");
  invariant(partners, "Partners not found");
  invariant(celebrations, "Priorities not found");

  return {
    people,
    person,
    partners,
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
    function keyDownCmdK(event: KeyboardEvent) {
      if (event.key === "k" && event.metaKey) {
        setOpenCmdK(!openCmdK);
      }
    }
    function keyDownNewAction(event: KeyboardEvent) {
      if (event.code === "KeyA" && event.altKey && event.metaKey) {
        setBaseAction({
          ...(getCleanAction(person.user_id) as unknown as Action),
        });
      }
    }
    document.addEventListener("keydown", keyDownCmdK);
    document.addEventListener("keydown", keyDownNewAction);

    return () => {
      document.removeEventListener("keydown", keyDownCmdK);
      document.removeEventListener("keydown", keyDownNewAction);
    };
  }, []);

  const navigate = useNavigate();

  return (
    <div id="app" className="flex h-screen flex-col">
      {/* HEADER */}

      <Header
        person={person}
        setBaseAction={setBaseAction}
        setOpenCmdK={setOpenCmdK}
      />
      <div className="flex h-full w-full overflow-hidden">
        <div className="grow overflow-x-hidden overflow-y-auto">
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
        <DialogContent className="squircle rounded-2xl p-0">
          <Command className="squircle rounded-2xl">
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
