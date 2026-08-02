import type { Action } from "~/types";
import { ActionContainer } from "~/components/features/ActionContainer";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import { HomeViewWrapper } from "./HomeViewWrapper";
import { PrismSkeleton } from "~/components/prism";
import { useLoading } from "~/hooks/useLoading";

export function HomeSprintView({ actions }: { actions: Action[] }) {
  const isLoading = useLoading(["actions"]);
  const [viewOptions, setViewOptions] = useViewOptions({
    variant: VARIANT.block,
    showOptions: {
      variant: true,
      columns: true,
    },
  });

  return (
    <HomeViewWrapper
      title="Sprint"
      OptionsComponent={
        <ViewOptionsComponent
          viewOptions={viewOptions}
          setViewOptions={setViewOptions}
        />
      }
    >
      <div className="px-8 xl:px-16">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <PrismSkeleton key={`sprint-skeleton-${i}`} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
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
        )}
      </div>
    </HomeViewWrapper>
  );
}
