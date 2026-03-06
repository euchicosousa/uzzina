import { useState } from "react";
import { ActionContainer } from "~/components/features/ActionContainer";
import { SignalIcon, SignalMediumIcon, SignalZeroIcon } from "lucide-react";
import {
  ViewOptionsComponent,
  useViewOptions,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { VARIANT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function SprintHomeComponent({ actions }: { actions: Action[] }) {
  const [viewOptions, setViewOptions] = useViewOptions({
    variant: VARIANT.block,
    showOptions: {
      variant: true,
    },
  });

  return (
    <HomeComponentWrapper
      title="Sprints"
      OptionsComponent={
        <div className="flex items-center gap-4">
          <div></div>
          <ViewOptionsComponent
            viewOptions={viewOptions}
            setViewOptions={setViewOptions}
          />
        </div>
      }
    >
      <div className="px-8 pb-8 xl:px-16">
        <ActionContainer
          showCategory
          showPartner
          showResponsibles
          actions={actions}
          columns={7}
          variant={viewOptions.variant}
          showLate
        />
      </div>
    </HomeComponentWrapper>
  );
}
