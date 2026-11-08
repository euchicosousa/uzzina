import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { AppThemeProvider } from "~/hooks/useAppTheme";
import { PrismToaster } from "~/components/prism";
export interface RouterContext {
  queryClient: QueryClient;
}
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isPublic =
    pathname === "/" || pathname === "/dash" || pathname.startsWith("/dash/");
  return (
    <AppThemeProvider isPublic={isPublic}>
      <Outlet />
      <PrismToaster richColors />
    </AppThemeProvider>
  );
}
