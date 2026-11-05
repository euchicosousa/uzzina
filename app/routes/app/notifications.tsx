import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "~/components/features/NotificationsPage";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});
