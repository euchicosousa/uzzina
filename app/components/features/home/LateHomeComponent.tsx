import { useState } from "react";
import { ActionContainer } from "~/components/features/ActionContainer";
import {
  ViewOptionsComponent,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { ORDER_BY } from "~/lib/CONSTANTS";
import { getLateActions } from "~/lib/helpers";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function LateHomeComponent({ actions }: { actions: Action[] }) {
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    ascending: true,
    partner: true,
    category: true,
    order: ORDER_BY.date,
    showOptions: {
      ascending: true,
      order: true,
      category: true,
      partner: true,
      responsibles: true,
      variant: true,
    },
  });
  actions = getLateActions(actions);
  return (
    <HomeComponentWrapper
      title="Atrasados"
      OptionsComponent={
        <ViewOptionsComponent
          viewOptions={viewOptions}
          setViewOptions={setViewOptions}
        />
      }
    >
      <div className="p-8 xl:px-16">
        <ActionContainer
          orderBy={viewOptions.order}
          ascending={viewOptions.ascending}
          variant={viewOptions.variant}
          showDivider={true}
          actions={actions}
          columns={viewOptions.variant != "content" ? 3 : 6}
          showResponsibles={viewOptions.responsibles}
          showPartner={viewOptions.partner}
          showCategory={viewOptions.category}
        />
      </div>
    </HomeComponentWrapper>
  );
}
