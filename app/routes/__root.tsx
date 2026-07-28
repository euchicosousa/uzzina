import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
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
  return (
    <AppThemeProvider>
      <Outlet />
      <PrismToaster richColors />
    </AppThemeProvider>
  );
}
