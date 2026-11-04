import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { Route as GalleryRoute } from "~/routes/ui";
import { AppThemeProvider } from "~/hooks/useAppTheme";
import { PrismToaster } from "~/components/prism";
import "~/tailwind.css";

const rootRoute = createRootRoute({
  component: () => (
    <AppThemeProvider>
      <Outlet />
      <PrismToaster />
    </AppThemeProvider>
  ),
});
const uiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ui",
  component: GalleryRoute.options.component,
});
// Browser history and restoration are essential to reproduce competing hash scrolls.
const router = createRouter({
  routeTree: rootRoute.addChildren([uiRoute]),
  scrollRestoration: true,
});
const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
