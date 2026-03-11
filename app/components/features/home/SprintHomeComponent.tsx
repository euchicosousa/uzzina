import { ActionContainer } from "~/components/features/ActionContainer";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { VARIANT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";

export function SprintHomeComponent({ actions }: { actions: Action[] }) {
  const [viewOptions, setViewOptions] = useViewOptions({
    variant: VARIANT.block,
    showOptions: {
      variant: true,
      columns: true,
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
          columns={viewOptions.columns || 4}
          variant={viewOptions.variant}
          showLate
        />
      </div>
    </HomeComponentWrapper>
  );
}
