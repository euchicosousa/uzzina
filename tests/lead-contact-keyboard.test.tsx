import { afterEach, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LeadDetail } from "~/components/features/leads/LeadDetail";

afterEach(cleanup);

it.each([
  { phone: "(11) 99999-1234", destination: "https://wa.me/5511999991234" },
  { phone: "+55 (11) 99999-1234", destination: "https://wa.me/5511999991234" },
])(
  "contact $phone has one Tab stop and Enter activates its unchanged destination",
  async ({ phone, destination }) => {
    const lead: Lead = {
      id: "contact-fixture",
      name: "Lead de teste",
      whatsapp: phone,
      main_need: null,
      completed: true,
      created_at: null,
      updated_at: null,
      answers: [],
    };
    render(
      <>
        <button type="button">Antes do contato</button>
        <LeadDetail lead={lead} />
        <button type="button">Depois do contato</button>
      </>,
    );
    const link = screen.getByRole("link", { name: phone });
    expect(link.getAttribute("href")).toBe(destination);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    const user = userEvent.setup();
    act(() => screen.getByRole("button", { name: "Antes do contato" }).focus());
    await user.tab();
    expect(document.activeElement === link).toBe(true);
    await user.tab();
    expect(
      document.activeElement ===
        screen.getByRole("button", { name: "Depois do contato" }),
    ).toBe(true);
    expect(screen.queryByRole("button", { name: phone })).toBeNull();
    const navigations: (string | null)[] = [];
    // Exercise native Enter activation while preventing any external navigation/contact.
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigations.push(link.getAttribute("href"));
    });
    act(() => link.focus());
    await user.keyboard("{Enter}");
    expect(navigations).toEqual([destination]);
  },
);
