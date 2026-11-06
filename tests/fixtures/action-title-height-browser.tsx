import { createRoot } from "react-dom/client";
import { ActionItem } from "~/components/features/ActionItem";
import { CalendarTestProviders, calendarAction } from "./calendar-height";
import "~/tailwind.css";

const params = new URLSearchParams(location.search);
const requestedVariant = params.get("variant");
const variant =
  requestedVariant === "block" || requestedVariant === "content"
    ? requestedVariant
    : "line";
const title =
  params.get("long") === "true"
    ? "A long action title that wraps across two lines in a narrow card"
    : "Drinks";
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <CalendarTestProviders>
      <div style={{ width: 264, margin: 24 }}>
        <ActionItem
          action={calendarAction(0, {
            title,
            category: variant === "content" ? "post" : "design",
          })}
          variant={variant}
        />
        <div data-testid="following">Following item</div>
      </div>
    </CalendarTestProviders>,
  );
}
