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
import { getCleanAction } from "~/lib/helpers";
import { getAllCelebrations } from "~/models/celebrations.server";
import { getPartnersByUserId } from "~/models/partners.server";
import { getAllVisiblePeople } from "~/models/people.server";
import { getUserId } from "~/services/auth.server";

import { Toaster } from "sonner";
import { GlobalSearchCommand } from "~/components/features/GlobalSearchCommand";
import type { Action } from "~/models/actions.server";

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
  cloudName: string;
  uploadPreset: string;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const [people, partners, celebrations] = await Promise.all([
    getAllVisiblePeople(supabase),
    getPartnersByUserId(supabase, user_id),
    getAllCelebrations(supabase),
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
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET!,
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
      <GlobalSearchCommand
        open={openCmdK}
        onOpenChange={setOpenCmdK}
        partners={partners}
        setBaseAction={setBaseAction}
      />
    </div>
  );
}
