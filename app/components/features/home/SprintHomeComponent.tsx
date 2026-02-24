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
    showOptions: {
      priority: true,
      category: true,
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
        {viewOptions.priority ? (
          <div className="grid grid-cols-3">
            <div className="flex flex-col">
              <div className="mb-4 flex items-center gap-1">
                <div className="relative">
                  <Signal className="absolute top-0 left-0 size-6 opacity-20" />
                  <SignalZero className="size-6 text-green-500" />
                </div>
                <h5 className="p-0"> LOW</h5>
              </div>

              <ActionContainer
                showCategory={viewOptions.category}
                showPriority={viewOptions.priority}
                actions={actions.filter(
                  (action) => action.priority === PRIORITIES.low.slug,
                )}
                variant={VARIANT.block}
                showLate
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-4 flex items-center gap-1">
                <div className="relative">
                  <Signal className="absolute top-0 left-0 size-6 opacity-20" />
                  <SignalMedium className="size-6 text-yellow-500" />
                </div>
                <h5 className="p-0"> MEDIUM</h5>
              </div>

              <ActionContainer
                showCategory={viewOptions.category}
                showPriority={viewOptions.priority}
                actions={actions.filter(
                  (action) => action.priority === PRIORITIES.medium.slug,
                )}
                variant={VARIANT.block}
                showLate
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-4 flex items-center gap-1">
                <div className="relative">
                  <Signal className="size-6 text-red-500" />
                </div>
                <h5 className="p-0"> HIGH</h5>
              </div>

              <ActionContainer
                showCategory={viewOptions.category}
                showPriority={viewOptions.priority}
                actions={actions.filter(
                  (action) => action.priority === PRIORITIES.high.slug,
                )}
                variant={VARIANT.block}
                showLate
              />
            </div>
          </div>
        ) : (
          <ActionContainer
            showCategory={viewOptions.category}
            showPriority={viewOptions.priority}
            actions={actions}
            columns={7}
            variant={VARIANT.block}
            showLate
          />
        )}
      </div>
    </HomeComponentWrapper>
  );
}
