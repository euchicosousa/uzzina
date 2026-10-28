import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppContext } from "../app/contexts/AppContext";
import { PartnersCombobox } from "../app/components/features/PartnersCombobox";
import { ResponsiblesCombobox } from "../app/components/features/ResponsiblesCombobox";
import { SprintCombobox } from "../app/components/features/SprintCombobox";
import { PhaseCombobox } from "../app/components/features/PhaseCombobox";
import { CategoriesCombobox } from "../app/components/features/CategoriesCombobox";
import { QUERY_KEYS } from "../app/lib/query-keys";
import type { Partner, Person } from "../app/types";

if (!("CSS" in globalThis)) {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
}
Object.assign(globalThis, {
  KeyboardEvent: window.KeyboardEvent,
  MouseEvent: window.MouseEvent,
  PointerEvent: window.MouseEvent,
});
afterEach(cleanup);
const people: Person[] = ["Ana", "Bia", "Caio", "Dora"].map((name) => ({
  id: name,
  user_id: name,
  name,
  surname: "Silva",
  short: name,
  initials: name[0],
  admin: false,
  visible: true,
  areas: [],
  created_at: "2026-10-11",
  email: null,
  image: null,
  preferences: {},
}));
const partners: Partner[] = ["Alpha", "Beta", "Gamma", "Delta"].map(
  (title) => ({
    id: title,
    slug: title,
    title,
    short: title,
    archived: false,
    colors: ["#000", "#fff"],
    users_ids: people.map((person) => person.user_id),
    created_at: "2026-10-11",
    context: null,
    image: null,
    instagram_caption_tail: null,
    sow: "marketing",
    voice: null,
  }),
);
type Kind = "partners" | "responsibles" | "sprint" | "phases" | "categories";
const cases: {
  kind: Kind;
  initial: string[];
  selected: string;
  unselected: string;
  selectedLabel: string;
  unselectedLabel: string;
}[] = [
  {
    kind: "partners",
    initial: ["Alpha", "Beta", "Gamma"],
    selected: "Alpha",
    unselected: "Delta",
    selectedLabel: "Alpha",
    unselectedLabel: "Delta",
  },
  {
    kind: "responsibles",
    initial: ["Ana", "Bia", "Caio"],
    selected: "Ana",
    unselected: "Dora",
    selectedLabel: "Ana",
    unselectedLabel: "Dora",
  },
  {
    kind: "sprint",
    initial: ["Ana", "Bia", "Caio"],
    selected: "Ana",
    unselected: "Dora",
    selectedLabel: "Ana Silva",
    unselectedLabel: "Dora Silva",
  },
  {
    kind: "phases",
    initial: ["idea", "do", "doing"],
    selected: "idea",
    unselected: "review",
    selectedLabel: "Ideia",
    unselectedLabel: "Análise",
  },
  {
    kind: "categories",
    initial: ["ads", "capture", "carousel"],
    selected: "ads",
    unselected: "design",
    selectedLabel: "Tráfego Pago",
    unselectedLabel: "Design",
  },
];
function Harness({ kind, initial }: { kind: Kind; initial: string[] }) {
  const [selection, setSelection] = useState(initial);
  const [responsibles, setResponsibles] = useState(["Ana", "Bia", "Caio"]);
  return (
    <>
      {kind === "partners" && (
        <PartnersCombobox
          selectedPartners={selection}
          onSelect={setSelection}
        />
      )}
      {kind === "responsibles" && (
        <ResponsiblesCombobox
          selectedResponsibles={selection}
          currentPartners={partners}
          onSelect={setSelection}
        />
      )}
      {kind === "sprint" && (
        <SprintCombobox
          selectedSprints={selection}
          responsibles={responsibles}
          currentPartners={partners}
          onSelect={(sprints, nextResponsibles) => {
            setSelection(sprints);
            setResponsibles(nextResponsibles);
          }}
        />
      )}
      {kind === "phases" && (
        <PhaseCombobox
          isMulti
          selectedPhases={selection}
          onSelect={({ phases }) => setSelection(phases)}
        />
      )}
      {kind === "categories" && (
        <CategoriesCombobox
          isMulti
          showInstagramGroup
          selectedCategories={selection}
          onSelect={({ categories }) => setSelection(categories)}
        />
      )}
      <output data-testid="selection">{selection.join(",")}</output>
      <output data-testid="responsibles">{responsibles.join(",")}</output>
    </>
  );
}
function mount(kind: Kind, initial: string[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  client.setQueryData(QUERY_KEYS.people("Ana"), people);
  render(
    <QueryClientProvider client={client}>
      <AppContext.Provider
        value={{
          person: people[0],
          partners,
          cloudName: "",
          uploadPreset: "",
          setPrimaryAction: () => {},
          partnerFilters: [],
          setPartnerFilters: () => {},
        }}
      >
        <Harness kind={kind} initial={initial} />
      </AppContext.Provider>
    </QueryClientProvider>,
  );
  return userEvent.setup();
}
for (const testCase of cases) {
  for (const selected of [true, false]) {
    const target = selected ? testCase.selected : testCase.unselected;
    const label = selected ? testCase.selectedLabel : testCase.unselectedLabel;
    for (const keyboard of [true, false]) {
      it(`${testCase.kind}: Shift+${keyboard ? "Enter" : "click"} keeps only ${selected ? "selected" : "unselected"} option`, async () => {
        const user = mount(testCase.kind, testCase.initial);
        await user.click(screen.getByRole("button"));
        if (keyboard) {
          await user.type(screen.getByRole("searchbox"), label);
          await user.keyboard("{ArrowDown}{Shift>}{Enter}{/Shift}");
        } else {
          await user.keyboard("{Shift>}");
          await user.click(
            screen.getByRole("menuitem", { name: new RegExp(`${label}$`) }),
          );
          await user.keyboard("{/Shift}");
        }
        expect(screen.getByTestId("selection").textContent).toBe(target);
        if (testCase.kind === "sprint") {
          expect(screen.getByTestId("responsibles").textContent).toBe(
            selected ? "Ana,Bia,Caio" : "Ana,Bia,Caio,Dora",
          );
        }
      });
    }
    it(`${testCase.kind}: ordinary Enter ${selected ? "removes" : "adds"} one option`, async () => {
      const user = mount(testCase.kind, testCase.initial);
      await user.click(screen.getByRole("button"));
      await user.type(screen.getByRole("searchbox"), label);
      await user.keyboard("{ArrowDown}{Enter}");
      expect(screen.getByTestId("selection").textContent).toBe(
        (selected
          ? testCase.initial.filter((item) => item !== target)
          : [...testCase.initial, target]
        ).join(","),
      );
    });
  }
}
for (const [kind, label, expected] of [
  ["phases", "Todas as fases", "all"],
  ["categories", "Todas as categorias", "all"],
  ["categories", "Feed do Instagram", "post,reels,carousel"],
] as const) {
  it(`${kind}: Shift+Enter preserves special option ${label}`, async () => {
    const user = mount(kind, ["idea", "ads"]);
    await user.click(screen.getByRole("button"));
    await user.type(screen.getByRole("searchbox"), label);
    await user.keyboard("{ArrowDown}{Shift>}{Enter}{/Shift}");
    expect(screen.getByTestId("selection").textContent).toBe(expected);
  });
}
