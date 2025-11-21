import { VARIANT } from "~/lib/CONSTANTS";
import { ActionContainer } from "../features/ActionContainer";
import { ORDER_BY } from "~/lib/CONSTANTS";

export default function FeedComponent({
  actions,
  orderBy = ORDER_BY.instagram_date,
  ascending = true,
}: {
  actions: Action[];
  orderBy?: (typeof ORDER_BY)[keyof typeof ORDER_BY];
  ascending?: boolean;
}) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <h5 className="pb-8">Feed do Instagram</h5>
      <div className="pb-8">
        <ActionContainer
          columns={6}
          actions={actions}
          variant={VARIANT.content}
          showCategory
          isInstagramDate
          orderBy={orderBy}
          ascending={ascending}
        />
      </div>
    </div>
  );
}
