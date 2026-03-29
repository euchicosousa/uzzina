import { sortActions } from "~/utils/sort";
import { UAvatar } from "../uzzina/UAvatar";
import { Content } from "./Content";
import { CATEGORIES, type CATEGORY } from "~/lib/CONSTANTS";

export function FeedSection({
  actions,
  onActionClick,
  currentPartner,
}: {
  actions: Action[];
  onActionClick: (action: Action) => void;
  currentPartner: Partner;
}) {
  actions = sortActions(actions, "date", false);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <UAvatar
          fallback={currentPartner.short}
          image={currentPartner.image}
          color={currentPartner.colors[1]}
          backgroundColor={currentPartner.colors[0]}
        />
        <div className="font-medium">{currentPartner.title}</div>
      </div>

      {actions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhuma publicação programada.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-px">
          {actions.map((action) => (
            <div
              key={action.id}
              onClick={() => onActionClick(action)}
              className="relative transition-opacity hover:opacity-60"
            >
              <Content
                action={action}
                isSquared
                category={CATEGORIES[action.category as CATEGORY]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
