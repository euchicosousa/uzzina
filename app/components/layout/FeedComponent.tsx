import { VARIANT } from "~/lib/CONSTANTS";
import { ActionContainer } from "../features/ActionContainer";

export default function FeedComponent({ actions }: { actions: Action[] }) {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <h5 className="p-8 pb-4">Feed do Instagram</h5>
      <div className="px-8 pb-8">
        <ActionContainer
          columns={6}
          actions={actions}
          variant={VARIANT.content}
          showCategory
          isInstagramDate
        />
      </div>
    </div>
  );
}
