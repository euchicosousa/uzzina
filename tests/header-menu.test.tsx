import "./dom-setup";
import { afterEach, beforeEach, expect, it, mock } from "bun:test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Person } from "~/types";

// The DOM test environment has no CSS.escape, which react-aria uses to focus menu items.
if (!("CSS" in globalThis)) {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
}
if (!("localStorage" in globalThis)) {
  Object.assign(globalThis, { localStorage: window.localStorage });
}

let savedPatches: Record<string, unknown>[] = [];
// Only the database boundary is controlled; the menu, theme and persistence logic are real.
mock.module("~/lib/supabase.client", () => ({
  createSupabaseBrowserClient: () => ({
    rpc: async (_name: string, args: { p_patch: Record<string, unknown> }) => {
      savedPatches.push(args.p_patch);
      return { data: { ...args.p_patch }, error: null };
    },
  }),
}));
const { HeaderMenu } = await import("../app/components/layout/Header");
const { AppThemeProvider } = await import("../app/hooks/useAppTheme");
const { PALLETE } = await import("../app/lib/palettes");

const person = {
  user_id: "u1",
  short: "CS",
  image: null,
  preferences: {},
} as unknown as Person;

beforeEach(() => {
  savedPatches = [];
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

const user = userEvent.setup();

async function openMenu() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AppThemeProvider>
        <HeaderMenu person={person} />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
  await user.click(
    screen.getByRole("button", { name: "Menu do perfil do usuário" }),
  );
}

const source = (name: string) => screen.getByRole("menuitemradio", { name });

it("partner colors and the palette are exclusive choices that keep the menu open", async () => {
  localStorage.setItem("uzzina-follow-partner-color", "true");
  await openMenu();
  await waitFor(() =>
    expect(source("Do parceiro").getAttribute("aria-checked")).toBe("true"),
  );
  expect(source("Escolher cor").getAttribute("aria-checked")).toBe("false");

  await user.click(source("Escolher cor"));

  expect(source("Escolher cor").getAttribute("aria-checked")).toBe("true");
  expect(source("Do parceiro").getAttribute("aria-checked")).toBe("false");
  await waitFor(() =>
    expect(savedPatches).toEqual([{ followPartnerColor: false }]),
  );
});

it("picking a swatch while partner colors are active switches to that color", async () => {
  localStorage.setItem("uzzina-follow-partner-color", "true");
  await openMenu();
  await waitFor(() =>
    expect(source("Do parceiro").getAttribute("aria-checked")).toBe("true"),
  );
  const third = PALLETE[2];
  if (!third) throw new Error("Palette has fewer than three colors");

  await user.click(screen.getByRole("menuitem", { name: third.label }));

  expect(source("Escolher cor").getAttribute("aria-checked")).toBe("true");
  await waitFor(() =>
    expect(savedPatches).toEqual([
      { themeColorIndex: 2, followPartnerColor: false },
    ]),
  );
});
