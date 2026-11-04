import { useState } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "react-aria";
import { UCalendarToolbar } from "~/components/uzzina/UCalendarToolbar";
import "~/tailwind.css";

function Fixture() {
  const params = new URLSearchParams(location.search);
  const [date, setDate] = useState(
    new Date(params.get("date") || "2026-09-15T12:00:00"),
  );
  return (
    <I18nProvider locale="pt-BR">
      <main style={{ padding: 16 }}>
        <output data-testid="date">
          {date.getFullYear()}-{date.getMonth() + 1}-{date.getDate()}
        </output>
        <UCalendarToolbar currentDay={date} setCurrentDay={setDate} />
      </main>
    </I18nProvider>
  );
}
const root = document.getElementById("root");
if (root) createRoot(root).render(<Fixture />);
