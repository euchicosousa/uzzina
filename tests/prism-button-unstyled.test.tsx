import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, LinkButton, buttonVariants } from "~/components/prism/button";

afterEach(cleanup);

it("keeps unstyled button, link and composition styles consistent", () => {
  render(
    <>
      <Button variant="unstyled" className="caller-style">
        Edit
      </Button>
      <LinkButton variant="unstyled" href="#target" className="caller-style">
        Open
      </LinkButton>
    </>,
  );
  expect(screen.getByRole("button").className).toBe("caller-style");
  expect(screen.getByRole("link").className).toBe("caller-style");
  expect(
    buttonVariants({ variant: "unstyled", className: "caller-style" }),
  ).toBe("caller-style");
});

it("preserves keyboard activation and disabled behavior without submitting the form", async () => {
  let presses = 0;
  let submissions = 0;
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Button variant="unstyled" onPress={() => presses++}>
        Edit
      </Button>
      <Button variant="unstyled" isDisabled onPress={() => presses++}>
        Disabled
      </Button>
      <button type="button">After</button>
    </form>,
  );
  const user = userEvent.setup();
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("button", { name: "Edit" }),
  ).toBe(true);
  await user.keyboard("{Enter}");
  await user.keyboard(" ");
  expect(presses).toBe(2);
  expect(submissions).toBe(0);
  await user.tab();
  expect(
    document.activeElement === screen.getByRole("button", { name: "After" }),
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Disabled" }));
  expect(presses).toBe(2);
});
