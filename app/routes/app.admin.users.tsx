import { UserPlusIcon } from "lucide-react";
import { Link, type MetaFunction } from "react-router";
import { Button } from "~/components/ui/button";
import { UBadge } from "~/components/uzzina/UBadge";
export const meta: MetaFunction = () => {
  return [
    {
      title: "Admin | Usuários",
    },
  ];
};
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
export default function AdminUsersPage() {
  const { data: people = [] } = useQuery({
    queryKey: QUERY_KEYS.people(),
    queryFn: fetchPeople,
  });
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
        <Button asChild className="squircle rounded-2xl" variant={"secondary"}>
          <Link to="/app/admin/user/new">
            Novo Usuário <UserPlusIcon />
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
import { AdminItemCard } from "~/components/uzzina/AdminItemCard";

function UserItem({ person }: { person: Person }) {
  return (
    <AdminItemCard
      to={`/app/admin/user/${person.user_id}`}
      image={person.image}
      fallback={person.initials}
      title={`${person.name} ${person.surname}`}
      subtitle={person.email}
      badge={
        person.admin && (
          <UBadge
            className="text-[10px]"
            size="sm"
            text="Admin"
            variant="default"
          />
        )
      }
    />
  );
}
