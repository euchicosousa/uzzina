import type { Action } from "~/types";
import { ActionContainer } from "~/components/features/ActionContainer";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { HomeViewWrapper } from "./HomeViewWrapper";
import { VARIANT } from "~/lib/CONSTANTS";

export function HomeLateView({ actions }: { actions: Action[] }) {
  const [viewOptions, setViewOptions] = useViewOptions({
    partner: true,
    variant: VARIANT.block,
    showOptions: {
      ascending: true,
      order: true,
      category: true,
      partner: true,
      responsibles: true,
      variant: true,
    },
  });
  return (
    <HomeViewWrapper
      title="Atrasadas"
      OptionsComponent={
        <ViewOptionsComponent
          viewOptions={viewOptions}
          setViewOptions={setViewOptions}
        />
      }
    >
      <div className="px-8 xl:px-16">
        <ActionContainer
          actions={actions}
          ascending={viewOptions.ascending}
          columns={viewOptions.columns}
          displayFlags={{
            showCategory: viewOptions.category,
            showLate: viewOptions.late,
            showPartner: viewOptions.partner,
            showPriority: viewOptions.priority,
            showResponsibles: viewOptions.responsibles,
          }}
          orderBy={viewOptions.order}
          variant={viewOptions.variant}
        />
      </div>
    </HomeViewWrapper>
  );
}
