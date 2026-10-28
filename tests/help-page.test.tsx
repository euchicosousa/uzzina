import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppContext } from "~/contexts/AppContext";
import type { Person } from "~/types";
import { calendarPerson } from "./fixtures/calendar-height";

const { Route } = await import("~/routes/app/help");

function page(person: Person) {
  const Page = Route.options.component as () => React.ReactNode;
  return (
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
      <Page />
    </AppContext.Provider>
  );
}

afterEach(cleanup);

it("replaces the placeholder with the help content", () => {
  render(page(calendarPerson));
  expect(screen.queryByText(/Hello/)).toBeNull();
  expect(
    screen.getByRole("heading", { level: 1, name: "Ajuda e documentação" }),
  ).toBeTruthy();
});

it("lists every section in the index and links to its heading", () => {
  render(page({ ...calendarPerson, admin: false }));
  const index = screen.getAllByRole("navigation", { name: "Nesta página" })[0];
  const links = within(index).getAllByRole("link");
  expect(links.map((link) => link.textContent)).toEqual([
    "Busca global",
    "Criar e editar ações",
    "Duas ações ao mesmo tempo",
    "Atalhos nas ações",
    "Minha conta e temas",
  ]);
  for (const link of links) {
    const id = link.getAttribute("href")?.slice(1);
    const heading = document.getElementById(String(id));
    expect(heading?.tagName).toBe("H2");
    expect(heading?.textContent).toBe(link.textContent);
  }
});

it("covers the shortcuts that exist today", () => {
  render(page(calendarPerson));
  expect(screen.getAllByText("Shift").length).toBeGreaterThan(0);
  expect(screen.getByText(/Incluir arquivadas/)).toBeTruthy();
  expect(screen.getByText(/Claro, Escuro e Sistema/)).toBeTruthy();
});

it("shows the administration section only to administrators", () => {
  const { unmount } = render(page({ ...calendarPerson, admin: false }));
  expect(screen.queryByRole("heading", { name: "Administração" })).toBeNull();
  unmount();
  render(page(calendarPerson));
  expect(screen.getByRole("heading", { name: "Administração" })).toBeTruthy();
});

it("moves focus to the section when an index link is activated", async () => {
  render(page(calendarPerson));
  const index = screen.getAllByRole("navigation", { name: "Nesta página" })[0];
  await userEvent.click(
    within(index).getByRole("link", { name: "Busca global" }),
  );
  expect(window.location.hash).toBe("#busca-global");
});
