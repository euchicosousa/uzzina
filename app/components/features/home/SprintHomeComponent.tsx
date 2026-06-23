import { ActionContainer } from "~/components/features/ActionContainer";
import {
  ViewOptionsComponent,
  useViewOptions,
} from "~/components/features/ViewOptions";
import { ORDER_BY, VARIANT } from "~/lib/CONSTANTS";
import type { Action } from "~/models/actions.server";
import { HomeComponentWrapper } from "./HomeComponentWrapper";
import { Skeleton } from "~/components/ui/skeleton";
import { useLoading } from "~/hooks/useLoading";

export function SprintHomeComponent({ actions }: { actions: Action[] }) {
  const isLoading = useLoading(["actions"]);
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
        {isLoading && actions.length === 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static list of skeleton loaders
                key={index}
                delay={index * 200}
                className="h-23 w-full rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <ActionContainer
            showCategory
            showPartner
            showResponsibles
            actions={actions}
            columns={viewOptions.columns || 4}
            variant={viewOptions.variant}
            showLate
            showSprint={false}
            orderBy={ORDER_BY.phase}
          />
        )}
      </div>
    </HomeComponentWrapper>
  );
}
