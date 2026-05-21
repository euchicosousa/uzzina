import { ActionContainer } from "~/components/features/ActionContainer";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";
import { VARIANT } from "~/lib/CONSTANTS";

export function LateHomeComponent({ actions }: { actions: Action[] }) {
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
