import "./dom-setup";
import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContext } from "~/contexts/AppContext";
import type { Person } from "~/types";

if (!("CSS" in globalThis)) {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
}
if (!("localStorage" in globalThis)) {
  Object.assign(globalThis, { localStorage: window.localStorage });
}
if (!("ResizeObserver" in globalThis)) {
  Object.assign(globalThis, {
    ResizeObserver: class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  });
}

let writes = 0;
// Only the database boundary is controlled; the profile page and theme are real.
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    from: () => {
      writes += 1;
      throw new Error("profile must not write before explicit save");
    },
    rpc: async (name: string) => {
      // The monthly allowance meter (IA-M03) reads on mount; reads are allowed.
      if (name === "get_my_ai_allowance") return { data: null, error: null };
      writes += 1;
      throw new Error("profile must not write before explicit save");
    },
  }),
}));
const { Route } = await import("../app/routes/app/profile");
const { AppThemeProvider } = await import("../app/hooks/useAppTheme");
const { PALLETE } = await import("../app/lib/palettes");

const person = {
  user_id: "u1",
  name: "Ana",
  surname: "Souza",
  initials: "AS",
  short: "Ana",
  email: "ana@example.com",
  image: null,
  preferences: {},
} as unknown as Person;

beforeEach(() => {
  writes = 0;
  localStorage.clear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});
afterEach(cleanup);

function renderProfile() {
  const Page = Route.options.component;
  if (!Page) throw new Error("profile route has no component");
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AppContext.Provider
        value={{
          person,
          partners: [],
          cloudName: "test",
          uploadPreset: "test",
          setPrimaryAction() {},
          partnerFilters: [],
          setPartnerFilters() {},
        }}
      >
        <AppThemeProvider>
          <Page />
        </AppThemeProvider>
      </AppContext.Provider>
    </QueryClientProvider>,
  );
}

it("each named palette option shows a decorative swatch from the shared palette data", () => {
  renderProfile();
  const group = screen.getByRole("radiogroup", { name: "Cor de Destaque" });
  for (const palette of PALLETE) {
    const option = within(group).getByRole("radio", { name: palette.label });
    const swatch = option.querySelector("[data-palette-swatch]");
    if (!(swatch instanceof HTMLElement)) {
      throw new Error(`missing swatch for ${palette.label}`);
    }
    const { l, c, h } = palette.light.primary;
    expect(swatch.style.backgroundColor).toBe(`oklch(${l} ${c} ${h})`);
    expect(swatch.getAttribute("aria-hidden")).toBe("true");
    expect(option.textContent).toBe(palette.label);
  }
  const custom = within(group).getByRole("radio", { name: "Personalizado" });
  const customSwatch = custom.querySelector("[data-palette-swatch]");
  expect(customSwatch?.getAttribute("aria-hidden")).toBe("true");
});

it("selecting a palette previews it without writing until the manual save", async () => {
  renderProfile();
  const group = screen.getByRole("radiogroup", { name: "Cor de Destaque" });
  const target = PALLETE[1];
  const option = within(group).getByRole("radio", { name: target.label });
  await userEvent.setup().click(option);
  expect(option.getAttribute("aria-checked")).toBe("true");
  expect(writes).toBe(0);
});

it("uses real mobile section tabs while preference choices remain radios", async () => {
  const mounted = renderProfile();
  const tabs = screen.getByRole("tablist", { name: "Seção da conta" });
  const personal = within(tabs).getByRole("tab", {
    name: "Informações pessoais",
  });
  const preferences = within(tabs).getByRole("tab", { name: "Preferências" });
  expect(preferences.getAttribute("aria-selected")).toBe("true");
  const name =
    mounted.container.querySelector<HTMLInputElement>('input[name="name"]');
  if (!name) throw new Error("Personal section must stay mounted");
  const original = name;
  const user = userEvent.setup();
  act(() => preferences.focus());
  await user.keyboard("{ArrowLeft}");
  expect(personal.getAttribute("aria-selected")).toBe("true");
  await user.clear(name);
  await user.type(name, "Draft preserved");
  act(() => personal.focus());
  await user.keyboard("{ArrowRight}");
  expect(preferences.getAttribute("aria-selected")).toBe("true");
  expect(mounted.container.querySelector('input[name="name"]')).toBe(original);
  expect(name.value).toBe("Draft preserved");
  expect(screen.getByRole("radiogroup", { name: "Tema do App" })).toBeTruthy();
  expect(writes).toBe(0);
});
