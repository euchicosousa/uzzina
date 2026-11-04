import type { Action } from "~/types";
import { ActionContainer } from "~/components/features/ActionContainer";
import {
  UViewOptions,
  useUViewOptions,
} from "~/components/uzzina/UViewOptions";
import { HomeViewWrapper } from "./HomeViewWrapper";
import { VARIANT } from "~/lib/CONSTANTS";

export function HomeLateView({ actions }: { actions: Action[] }) {
  const [viewOptions, setViewOptions] = useUViewOptions({
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
        <UViewOptions
          viewOptions={viewOptions}
          setViewOptions={setViewOptions}
        />
      }
    >
      <div className="px-8">
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
