import { useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs, useMatches } from "react-router";
import invariant from "tiny-invariant";
import { ActionContainer } from "~/components/features/ActionContainer";
import { useViewOptions } from "~/components/features/ViewOptions";
import { useOptimisticActions } from "~/hooks/useOptimisticActions";
import { getUserId } from "~/services/auth.server";
// [ROLLBACK-LATE-LOADER] Imports do servidor comentados/removidos:
// import { getLateActionsByPartner } from "~/models/actions.server";

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "~/lib/query-keys";
import { fetchAllLateActions } from "~/lib/supabase.queries";
import type { AppLoaderData } from "./app";

export const runtime = "edge";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase } = await getUserId(request);

  // [ROLLBACK-LATE-LOADER] Bloco antigo buscava person, partner e actions no servidor:
  /*
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
  */

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .match({ slug: params.slug })
    .single();

  invariant(partner);

  return { partner };
};

export default function PartnerPage() {
  let { partner } = useLoaderData<typeof loader>();
  const { person, partners } = useMatches()[1].loaderData as AppLoaderData;

  const { data: actions = [] } = useQuery({
    queryKey: QUERY_KEYS.lateActions.user(person.user_id),
    queryFn: () =>
      fetchAllLateActions(
        person.user_id,
        person.admin,
        partners.map((p) => p.slug),
      ),
    select: (allLateActions) =>
      allLateActions.filter((action) => action.partners?.includes(partner.slug)),
  });

  let currentActions = useOptimisticActions(actions);
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
      filter_phase: true,
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

