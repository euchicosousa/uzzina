import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "~/components/theme-provider";
import { PrismToaster } from "~/components/prism";
export interface RouterContext {
  queryClient: QueryClient;
}
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});
function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
      <PrismToaster richColors />
    </ThemeProvider>
  );
}
