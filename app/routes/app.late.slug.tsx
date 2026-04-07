import { useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import { useViewOptions } from "~/components/features/ViewOptions";
import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { getLateActionsByPartner } from "~/models/actions.server";
import { getUserId } from "~/services/auth.server";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user_id, supabase } = await getUserId(request);

  const { data: person } = await supabase
    .from("people")
    .select("*")
    .match({ user_id: user_id })
    .single();

  invariant(person);

  const [{ data: partner }, actions] = await Promise.all([
    supabase.from("partners").select("*").match({ slug: params.slug }).single(),
    getLateActionsByPartner(supabase, params.slug!, user_id, person.admin),
  ]);

  invariant(partner);

  return { partner, actions };
};

export default function PartnerPage() {
  let { partner, actions } = useLoaderData<typeof loader>();
  let currentActions = useOptimisticActions(actions || []);
  const [query] = useState("");

  const [viewOptions] = useViewOptions({
    category: false,
    sprint: true,
    showOptions: {
      variant: true,
      responsibles: true,
      priority: true,
      category: true,
      partner: true,
      order: true,
      ascending: true,
      filter_category: true,
      filter_state: true,
      filter_responsible: true,
    },
  });

  const filteredActions = currentActions
    .filter((action) =>
      viewOptions.filter_category
        ? viewOptions.filter_category.includes(action.category)
        : action,
    )
    .filter((action) => {
      if (!query) return true;
      return action.title?.toLowerCase().includes(query.toLowerCase());
    });

  return (
    <div className="flex flex-col overflow-hidden">
      <h1 className="border_after flex justify-between p-8">
        Ações atrasadas{" "}
        <Link to={`/app/partner/${partner.slug}`} className="hover:underline">
          <span>{partner.title}</span>
        </Link>
      </h1>
      <div>
        {filteredActions.length > 0 ? (
          <ActionContainer actions={filteredActions} />
        ) : (
          <p className="p-8">Nenhuma ação atrasada encontrada</p>
        )}
      </div>
    </div>
  );
}
