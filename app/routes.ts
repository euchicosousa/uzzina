import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("app", "routes/app.tsx"),
  route("login", "routes/login.tsx"),
  route("ui", "routes/ui.tsx"),
  route("action/set-theme", "routes/action.set-theme.ts"),
] satisfies RouteConfig;
