import { useState } from "react";
import { ActionContainer } from "~/components/features/ActionContainer";
import { Signal, SignalMedium, SignalZero } from "lucide-react";
import {
  ViewOptionsComponent,
  type ViewOptions,
} from "~/components/features/ViewOptions";
import { PRIORITIES, VARIANT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function SprintHomeComponent({ actions }: { actions: Action[] }) {
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    variant: VARIANT.block,
    showOptions: {
      variant: true,
      // priority: true,
      // category: true,
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
          showCategory={viewOptions.category}
          showPriority={viewOptions.priority}
          actions={actions}
          columns={7}
          variant={viewOptions.variant}
          showLate
        />
      </div>
    </HomeComponentWrapper>
  );
}
