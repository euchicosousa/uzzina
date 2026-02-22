import { UserPlus } from "lucide-react";
import {
  Link,
  useLoaderData,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { UAvatar } from "~/components/uzzina/UAvatar";
import { UBadge } from "~/components/uzzina/UBadge";
import { getUserId } from "~/services/auth.server";

export const meta: MetaFunction = () => {
  return [{ title: "Admin | Usuários" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);

  const { data: people } = await supabase
    .from("people")
    .select("*")
    .order("name", { ascending: true });

  invariant(people, "People not found");

  return { people };
};

export default function AdminUsersPage() {
  const { people }: { people: Person[] } = useLoaderData<typeof loader>();

  const archivedPeople: Person[] = [];
  const activePeople: Person[] = [];

  people.forEach((person) => {
    if (!person.visible) {
      archivedPeople.push(person);
    } else {
      activePeople.push(person);
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="pb-0 text-2xl font-bold">Usuários</h1>
        <Button variant={"secondary"} asChild className="squircle rounded-2xl">
          <Link to="/app/admin/user/new">
            Novo Usuário <UserPlus />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {activePeople.map((person) => (
          <UserItem key={person.id} person={person} />
        ))}
      </div>

      {archivedPeople.length > 0 && (
        <>
          <div>
            <h2 className="mt-8 text-2xl font-bold">Usuários Arquivados</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {archivedPeople.map((person) => (
              <UserItem key={person.id} person={person} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserItem({ person }: { person: Person }) {
  return (
    <Link
      key={person.id}
      to={`/app/admin/user/${person.user_id}`}
      className={`hover:bg-muted/50 squircle flex items-center gap-4 rounded-3xl border p-4 transition-colors`}
    >
      <UAvatar fallback={person.initials} image={person.image} size="lg" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate font-medium">
            {person.name} {person.surname}
          </div>
          {person.admin && (
            <UBadge
              size="sm"
              variant="default"
              className="text-[10px]"
              text="Admin"
            />
          )}
        </div>
        <div className="text-muted-foreground truncate text-xs">
          {person.email}
        </div>
      </div>
    </Link>
  );
}
