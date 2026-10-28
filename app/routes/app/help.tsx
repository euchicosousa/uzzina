import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "~/components/features/HelpPage";

export const Route = createFileRoute("/app/help")({
  component: HelpPage,
});
