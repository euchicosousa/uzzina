import { UserPlusIcon } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchPeople } from "~/lib/supabase.queries";
export const Route = createFileRoute("/app/admin/users")({
  component: AdminUsersPage,
});
function AdminUsersPage() {
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
          <Link
            params={{
              userId: "new",
            }}
            to="/app/admin/user/$userId"
          >
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
import { PrismBadge } from "~/components/prism";
function UserItem({ person }: { person: Person }) {
  return (
    <AdminItemCard
      badge={person.admin && <PrismBadge>Admin</PrismBadge>}
      fallback={person.initials}
      image={person.image}
      subtitle={person.email}
      title={`${person.name} ${person.surname}`}
      to={`/app/admin/user/${person.user_id}`}
    />
  );
}
