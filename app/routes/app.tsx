import { HandshakeIcon, PlusIcon, SearchIcon } from "lucide-react";
import {
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import { UzzinaLogo } from "~/components/logo";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { UBadge } from "~/components/uzzina/UBadge";
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
    { title: "ᴜᴢᴢɪɴa - Domine, Crie e Conquiste." },
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
      <div className="border_after relative flex items-center p-4 justify-between">
        <div className="flex gap-2 items-center">
          <UzzinaLogo className="h-8" />
          <UBadge size="sm" value={17} isDynamic />
          <Button variant="ghost" size="icon" className="rounded-full">
            <SearchIcon />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" className="rounded-full">
            <PlusIcon />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full">
            <HandshakeIcon />
          </Button>
          <p className="text-sm font-medium">{loaderData.person.name}</p>
        </div>
      </div>
      {/* HEADER */}
      {/* BODY */}
    </div>
  );
}
