import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Content } from "../app/components/features/Content";
import type { DashActionDto } from "../app/services/dash-client";

afterEach(cleanup);

it("renders a client action without the private team context or query provider", () => {
  const action: DashActionDto = {
    id: "public-action",
    title: "Public client artwork",
    date: "2026-10-07T12:00:00",
    category: "post",
    phase: "doing",
    description: null,
    content_description: null,
    instagram_caption: null,
    content_files: [],
    work_files: [],
    color: "#ffffff",
    updated_at: "2026-10-07T12:00:00",
    partners: ["client-partner"],
  };
  render(<Content action={action} showDate={false} showResponsibles />);
  expect(screen.getByText("Public client artwork")).toBeTruthy();
});
