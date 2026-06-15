import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app.tsx", [
    index("routes/app.home.tsx"),
    route("partner/:slug", "routes/app.partner.$slug.tsx"),
    route("admin/partners", "routes/app.admin.partners.tsx"),
    route("admin/partner/:slug", "routes/app.admin.partner.$slug.tsx"),
    route("admin/users", "routes/app.admin.users.tsx"),
    route("admin/user/:user_id", "routes/app.admin.user.$userId.tsx"),
    route("admin/clients", "routes/app.admin.clients.tsx"),
    route("admin/clients/:userId", "routes/app.admin.clients.$userId.tsx"),
    route("admin/celebrations", "routes/app.admin.celebrations.tsx"),
    route("profile", "routes/app.profile.tsx"),
    route("help", "routes/app.help.tsx"),
    route("notifications", "routes/app.notifications.tsx"),
  ]),
  route("dash", "routes/dash.tsx", [
    index("routes/dash.home.tsx"),
    route("login", "routes/dash.login.tsx"),
    route("action/:id", "routes/dash.action.$id.tsx"),
  ]),
  route("login", "routes/login.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  // route("force-reset", "routes/force-reset.tsx"),

  route("ui", "routes/ui.tsx"),
  route("action/set-theme", "routes/action.set-theme.ts"),
  route("action/set-preferences", "routes/action.set-preferences.ts"),
  route("action/handle-action", "routes/action.handle-action.ts"),
  route("action/handle-notifications", "routes/action.handle-notifications.ts"),
  route("action/handle-ai", "routes/action.handle-ai.ts"),
  route("api/search", "routes/api.search.ts"),
] satisfies RouteConfig;
