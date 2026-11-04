import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ArchiveIcon } from "lucide-react";
import { PrismToggle } from "~/components/prism";

afterEach(cleanup);

function PartnerFormFixture({
  initialArchived = false,
  isDisabled = false,
  onSubmit,
}: {
  initialArchived?: boolean;
  isDisabled?: boolean;
  onSubmit?: (data: { archived: boolean }) => void;
}) {
  const [isArchived, setIsArchived] = useState(initialArchived);

  return (
    <form
      data-testid="partner-form"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit?.({
          archived: formData.get("archived") === "on",
        });
      }}
    >
      {isArchived && <input name="archived" type="hidden" value="on" />}
      <PrismToggle
        id="archived"
        isDisabled={isDisabled}
        isSelected={isArchived}
        onChange={setIsArchived}
        variant="outline"
      >
        <ArchiveIcon className="size-4" />
        {isArchived ? "Arquivado" : "Visível"}
      </PrismToggle>
      <button type="submit">Salvar Tudo</button>
    </form>
  );
}

it("omits archived from FormData when unselected and sends 'on' when selected", async () => {
  let submitted: { archived: boolean } | undefined;
  const user = userEvent.setup();

  render(
    <PartnerFormFixture
      initialArchived={false}
      onSubmit={(data) => {
        submitted = data;
      }}
    />,
  );

  const toggle = screen.getByRole("button", { name: /visível/i });
  expect(toggle.getAttribute("aria-pressed")).toBe("false");

  // Submit without selecting archived
  await user.click(screen.getByRole("button", { name: "Salvar Tudo" }));
  expect(submitted).toEqual({ archived: false });

  // Click toggle to mark archived
  await user.click(toggle);
  expect(screen.getByRole("button", { name: /arquivado/i })).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: /arquivado/i })
      .getAttribute("aria-pressed"),
  ).toBe("true");

  // Submit after marking archived
  await user.click(screen.getByRole("button", { name: "Salvar Tudo" }));
  expect(submitted).toEqual({ archived: true });

  // Click toggle again to unmark
  await user.click(screen.getByRole("button", { name: /arquivado/i }));
  await user.click(screen.getByRole("button", { name: "Salvar Tudo" }));
  expect(submitted).toEqual({ archived: false });
});

it("does not submit form on Space or Enter toggle activation", async () => {
  let submitCount = 0;
  const user = userEvent.setup();

  render(
    <PartnerFormFixture
      initialArchived={false}
      onSubmit={() => {
        submitCount++;
      }}
    />,
  );

  const toggle = screen.getByRole("button", { name: /visível/i });
  toggle.focus();
  expect(document.activeElement).toBe(toggle);

  // Press Space to toggle
  await user.keyboard(" ");
  expect(screen.getByRole("button", { name: /arquivado/i })).toBeDefined();
  expect(submitCount).toBe(0);

  // Press Space again to toggle back
  await user.keyboard(" ");
  expect(screen.getByRole("button", { name: /visível/i })).toBeDefined();
  expect(submitCount).toBe(0);
});

it("prevents interaction when disabled", async () => {
  const user = userEvent.setup();

  render(<PartnerFormFixture initialArchived={false} isDisabled={true} />);

  const toggle = screen.getByRole("button", { name: /visível/i });
  expect(toggle.hasAttribute("disabled")).toBe(true);

  await user.click(toggle);
  expect(screen.getByRole("button", { name: /visível/i })).toBeDefined();
  expect(toggle.getAttribute("aria-pressed")).toBe("false");
});
