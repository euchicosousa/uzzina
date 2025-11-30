import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app.tsx", [
    index("routes/app.home.tsx"),
    route("partner/:slug", "routes/app.partner.slug.tsx"),
  ]),
  route("teste", "routes/teste.tsx"),
  route("login", "routes/login.tsx"),
  route("ui", "routes/ui.tsx"),
  route("action/set-theme", "routes/action.set-theme.ts"),
  route("action/handle-action", "routes/action.handle-action.ts"),
  route("action/handle-ai", "routes/action.handle-ai.ts"),
] satisfies RouteConfig;
