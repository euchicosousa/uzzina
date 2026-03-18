import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app.tsx", [
    index("routes/app.home.tsx"),
    route("partner/:slug", "routes/app.partner.slug.tsx"),
    route("late/:slug", "routes/app.late.slug.tsx"),
    route("admin/partners", "routes/app.admin.partners.tsx"),
    route("admin/partner/:slug", "routes/app.admin.partner.slug.tsx"),
    route("admin/users", "routes/app.admin.users.tsx"),
    route("admin/user/:user_id", "routes/app.admin.user.id.tsx"),
    route("admin/clients", "routes/app.admin.clients.tsx"),
    route("admin/clients/:userId", "routes/app.admin.clients.$userId.tsx"),
    route("admin/celebrations", "routes/app.admin.celebrations.tsx"),
  ]),
  route("dash", "routes/dash.tsx", [
    index("routes/dash.home.tsx"),
    route("login", "routes/dash.login.tsx"),
    route("action/:id", "routes/dash.action.$id.tsx"),
  ]),
  route("teste", "routes/teste.tsx"),
  route("login", "routes/login.tsx"),
  route("ui", "routes/ui.tsx"),
  route("action/set-theme", "routes/action.set-theme.ts"),
  route("action/handle-action", "routes/action.handle-action.ts"),
  route("action/handle-ai", "routes/action.handle-ai.ts"),
  route("api/search", "routes/api.search.ts"),
] satisfies RouteConfig;
