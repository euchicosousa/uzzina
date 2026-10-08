import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getVisualizeGroups,
  ViewOptionsComponent,
  type ViewOptions,
} from "../app/components/features/ViewOptions";

// The DOM test environment has no CSS.escape, which react-aria uses to focus menu items.
if (!("CSS" in globalThis)) {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
}

afterEach(cleanup);

const base: ViewOptions = {
  variant: "line",
  columns: 4,
  ascending: true,
  order: "date",
  category: true,
  responsibles: false,
  priority: false,
  partner: false,
  showOptions: {
    variant: true,
    columns: true,
    autoHeight: true,
    order: true,
    ascending: true,
    responsibles: true,
    priority: true,
    category: true,
    partner: true,
  },
};

function mount(overrides: Partial<ViewOptions> = {}) {
  const calls: ViewOptions[] = [];
  render(
    <ViewOptionsComponent
      setViewOptions={(next) => calls.push(next)}
      viewOptions={{ ...base, ...overrides }}
    />,
  );
  return calls;
}

const user = userEvent.setup();

async function openMenu(menu: string) {
  await user.click(screen.getByRole("button", { name: menu }));
}

async function choose(
  menu: string,
  item: string,
  role: "menuitemradio" | "menuitemcheckbox" = "menuitemradio",
) {
  await openMenu(menu);
  await user.click(await screen.findByRole(role, { name: item }));
}

describe("ViewOptionsComponent", () => {
  it("replaces the icon-only row with three labelled menus", () => {
    mount();
    for (const label of ["Visualizar", "Ordenar", "Exibir"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(
      screen.queryByRole("button", { name: "Exibição em Linha" }),
    ).toBeNull();
  });

  it("changes the layout variant from Visualizar", async () => {
    const calls = mount();
    await choose("Visualizar", "Bloco");
    expect(calls.at(-1)?.variant).toBe("block");
  });

  it("changes order criterion and direction from Ordenar", async () => {
    const calls = mount();
    await choose("Ordenar", "Fase");
    expect(calls.at(-1)?.order).toBe("phase");
    await choose("Ordenar", "Decrescente");
    expect(calls.at(-1)?.ascending).toBe(false);
  });

  it("toggles displayed fields from Exibir keeping the others", async () => {
    const calls = mount();
    await choose("Exibir", "Prioridade", "menuitemcheckbox");
    expect(calls.at(-1)).toMatchObject({
      priority: true,
      category: true,
      responsibles: false,
      partner: false,
    });
  });

  it("hides the layout choice when the screen does not allow it", async () => {
    mount({ showOptions: { autoHeight: true } });
    await openMenu("Visualizar");
    expect(
      await screen.findByRole("menuitemcheckbox", {
        name: "Altura automática",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("menuitemradio", { name: "Linha" })).toBeNull();
  });

  it("never renders Visualizar without options inside", () => {
    mount({ variant: "content", showOptions: { autoHeight: true } });
    expect(screen.queryByRole("button", { name: "Visualizar" })).toBeNull();
    cleanup();
    mount({ variant: "line", showOptions: { columns: true } });
    expect(screen.queryByRole("button", { name: "Visualizar" })).toBeNull();
  });

  it("shows only the layout choice for the partner setup in content mode", async () => {
    mount({
      variant: "content",
      showOptions: { variant: true, autoHeight: true },
    });
    await openMenu("Visualizar");
    expect(
      await screen.findByRole("menuitemradio", { name: "Conteúdo" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("menuitemcheckbox", { name: "Altura automática" }),
    ).toBeNull();
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  it("offers columns only in the content variant", async () => {
    mount({ variant: "content" });
    await openMenu("Visualizar");
    expect(
      await screen.findByRole("menuitemradio", { name: "6 colunas" }),
    ).toBeTruthy();
  });
});

describe("Visualizar groups for each screen that uses it", () => {
  // showOptions copied from each screen's useViewOptions call.
  const screens: Record<string, ViewOptions["showOptions"]> = {
    sprint: { variant: true, columns: true },
    late: {
      ascending: true,
      order: true,
      category: true,
      partner: true,
      responsibles: true,
      variant: true,
    },
    calendar: { ascending: true, order: true },
    partner: {
      variant: true,
      autoHeight: true,
      responsibles: true,
      priority: true,
      category: true,
      partner: true,
      order: true,
      ascending: true,
      filter_category: true,
      filter_phase: true,
      filter_responsible: true,
    },
  };
  const groups = (name: string, variant: ViewOptions["variant"]) =>
    getVisualizeGroups({ variant, showOptions: screens[name] ?? {} });

  it("keeps what each screen showed before", () => {
    expect(groups("sprint", "block")).toEqual({
      variant: true,
      autoHeight: false,
      columns: false,
    });
    expect(groups("sprint", "content")).toEqual({
      variant: true,
      autoHeight: false,
      columns: true,
    });
    expect(groups("late", "block")).toEqual({
      variant: true,
      autoHeight: false,
      columns: false,
    });
    expect(groups("calendar", "line")).toEqual({
      variant: false,
      autoHeight: false,
      columns: false,
    });
    expect(groups("partner", "line")).toEqual({
      variant: true,
      autoHeight: true,
      columns: false,
    });
    expect(groups("partner", "content")).toEqual({
      variant: true,
      autoHeight: false,
      columns: false,
    });
  });

  it("does not render Visualizar on the home calendar", () => {
    render(
      <ViewOptionsComponent
        setViewOptions={() => {}}
        viewOptions={{ ...base, showOptions: screens.calendar ?? {} }}
      />,
    );
    expect(screen.queryByRole("button", { name: "Visualizar" })).toBeNull();
    expect(screen.getByRole("button", { name: "Ordenar" })).toBeTruthy();
  });
});
