import "./dom-setup";
import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PrismTabs,
  PrismTabList,
  PrismTab,
  PrismTabPanel,
} from "~/components/prism/tabs";

afterEach(cleanup);

if (!("CSS" in globalThis)) {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value } });
}

it("keeps mounted drafts while arrows switch accessible panels and skip disabled tabs", async () => {
  render(
    <PrismTabs defaultSelectedKey="one">
      <PrismTabList aria-label="Sections">
        <PrismTab id="one">One</PrismTab>
        <PrismTab id="disabled" isDisabled>
          Disabled
        </PrismTab>
        <PrismTab id="two">Two</PrismTab>
      </PrismTabList>
      <PrismTabPanel id="one" shouldForceMount>
        <input aria-label="Draft" />
      </PrismTabPanel>
      <PrismTabPanel id="two" shouldForceMount aria-label="Two">
        Second panel
      </PrismTabPanel>
    </PrismTabs>,
  );
  const user = userEvent.setup();
  const draft = screen.getByRole("textbox", { name: "Draft" });
  await user.type(draft, "Retained draft");
  await user.click(screen.getByRole("tab", { name: "One" }));
  await user.keyboard("{ArrowRight}");
  expect(
    screen.getByRole("tab", { name: "Two" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.queryByRole("textbox", { name: "Draft" })).toBeNull();
  const panel = screen.getByRole("tabpanel", { name: /^Two$/ });
  expect(panel.getAttribute("aria-labelledby")).toContain(
    screen.getByRole("tab", { name: "Two" }).id,
  );
  await user.keyboard("{ArrowLeft}");
  expect(screen.getByRole("textbox", { name: "Draft" })).toBe(draft);
  expect(draft).toHaveProperty("value", "Retained draft");
});

it("isolates nested tab collections and keeps side-by-side panels interactive", async () => {
  render(
    <PrismTabs defaultSelectedKey="left">
      <PrismTabList aria-label="Outer">
        <PrismTab id="left">Left</PrismTab>
        <PrismTab id="right">Right</PrismTab>
      </PrismTabList>
      <PrismTabPanel id="left" isAlwaysVisible aria-label="Left panel">
        <PrismTabs defaultSelectedKey="inside">
          <PrismTabList aria-label="Inner">
            <PrismTab id="inside">Inside</PrismTab>
            <PrismTab id="other">Other</PrismTab>
          </PrismTabList>
          <PrismTabPanel id="inside">Inner content</PrismTabPanel>
          <PrismTabPanel id="other">Other content</PrismTabPanel>
        </PrismTabs>
      </PrismTabPanel>
      <PrismTabPanel id="right" isAlwaysVisible aria-label="Right panel">
        <input aria-label="Right draft" />
      </PrismTabPanel>
    </PrismTabs>,
  );
  expect(
    within(screen.getByRole("tablist", { name: "Outer" })).getAllByRole("tab"),
  ).toHaveLength(2);
  expect(
    within(screen.getByRole("tablist", { name: "Inner" })).getAllByRole("tab"),
  ).toHaveLength(2);
  const right = screen.getByRole("region", { name: "Right panel" });
  expect(right.hasAttribute("inert")).toBe(false);
  expect(right.hidden).toBe(false);
  await userEvent.setup().click(screen.getByRole("tab", { name: "Other" }));
  expect(screen.getByText("Other content")).toBeTruthy();
  expect(
    screen.getByRole("tab", { name: "Left" }).getAttribute("aria-selected"),
  ).toBe("true");
});
