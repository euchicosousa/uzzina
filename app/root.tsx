import { QueryClientProvider } from "@tanstack/react-query";
import type { LoaderFunctionArgs } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import type { Route } from "./+types/root";
import { PALLETE } from "./lib/CONSTANTS";
import { queryClient } from "./lib/query-client";
import { cn } from "./lib/utils";
import { themeSessionResolver } from "./sessions.server";
import "./tailwind.css";
export const links: Route.LinksFunction = () => [
  // Favicon para o tema claro (light)
  {
    rel: "icon",
    href: "/favicon-light.png",
    sizes: "32x32",
    type: "image/png",
    media: "(prefers-color-scheme: light)",
  },
  // Favicon para o tema escuro (dark)
  {
    rel: "icon",
    href: "/favicon-dark.png",
    sizes: "32x32",
    type: "image/png",
    media: "(prefers-color-scheme: dark)",
  },
];
export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL || "",
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || "",
    },
  };
}
export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        specifiedTheme={data.theme}
        themeAction="/action/set-theme"
      >
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const { env } = data;
  const [theme] = useTheme();
  return (
    <html className={cn(theme)} lang="pt-br" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
        <script
          id="env-vars"
          type="application/json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Necessário para injetar env vars de forma segura em JSON
          dangerouslySetInnerHTML={{ __html: JSON.stringify(env) }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Script estático para ler env vars lidas via ID
          dangerouslySetInnerHTML={{
            __html: "window.__env = JSON.parse(document.getElementById('env-vars').textContent || '{}');",
          }}
        />
        <script
          id="theme-palette"
          type="application/json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Necessário para injetar paleta de cores estática em JSON
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PALLETE) }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Script crítico para evitar FOUC antes da hidratação
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var palette = JSON.parse(document.getElementById('theme-palette').textContent || '[]');
                var idx = localStorage.getItem("uzzina-accent-color-index");
                var n = (idx !== null && idx !== "") ? parseInt(idx, 10) : 0;
                var root = document.documentElement;
                
                if (n === -1) {
                  var lpOklch = localStorage.getItem("uzzina-custom-light-primary-oklch");
                  var lpfgOklch = localStorage.getItem("uzzina-custom-light-primary-fg-oklch") || "0 0 1";
                  var lbgOklch = localStorage.getItem("uzzina-custom-light-bg-oklch");
                  var lfgOklch = localStorage.getItem("uzzina-custom-light-fg-oklch");
                  var dpOklch = localStorage.getItem("uzzina-custom-dark-primary-oklch");
                  var dpfgOklch = localStorage.getItem("uzzina-custom-dark-primary-fg-oklch") || "0 0 1";
                  var dbgOklch = localStorage.getItem("uzzina-custom-dark-bg-oklch");
                  var dfgOklch = localStorage.getItem("uzzina-custom-dark-fg-oklch");
                  
                  if (lpOklch && lbgOklch && lfgOklch && dpOklch && dbgOklch && dfgOklch) {
                    var lpParts = lpOklch.split(" ");
                    var lpfgParts = lpfgOklch.split(" ");
                    var lbgParts = lbgOklch.split(" ");
                    var lfgParts = lfgOklch.split(" ");
                    var dpParts = dpOklch.split(" ");
                    var dpfgParts = dpfgOklch.split(" ");
                    var dbgParts = dbgOklch.split(" ");
                    var dfgParts = dfgOklch.split(" ");
                    
                    root.style.setProperty("--accent-h", lpParts[0]);
                    root.style.setProperty("--accent-c", lpParts[1]);
                    root.style.setProperty("--accent-l", lpParts[2]);
                    root.style.setProperty("--dark-accent-h", dpParts[0]);
                    root.style.setProperty("--dark-accent-c", dpParts[1]);
                    root.style.setProperty("--dark-accent-l", dpParts[2]);
                    
                    root.style.setProperty("--primary-foreground-override", "oklch(" + lpfgParts[2] + " " + lpfgParts[1] + " " + lpfgParts[0] + ")");
                    root.style.setProperty("--sidebar-primary-foreground-override", "oklch(" + lpfgParts[2] + " " + lpfgParts[1] + " " + lpfgParts[0] + ")");
                    root.style.setProperty("--dark-primary-foreground-override", "oklch(" + dpfgParts[2] + " " + dpfgParts[1] + " " + dpfgParts[0] + ")");
                    
                    root.style.setProperty("--background-override", "oklch(" + lbgParts[2] + " " + lbgParts[1] + " " + lbgParts[0] + ")");
                    root.style.setProperty("--foreground-override", "oklch(" + lfgParts[2] + " " + lfgParts[1] + " " + lfgParts[0] + ")");
                    root.style.setProperty("--dark-background-override", "oklch(" + dbgParts[2] + " " + dbgParts[1] + " " + dbgParts[0] + ")");
                    root.style.setProperty("--dark-foreground-override", "oklch(" + dfgParts[2] + " " + dfgParts[1] + " " + dfgParts[0] + ")");
                  }
                } else if (!isNaN(n) && palette[n]) {
                  var p = palette[n];
                  root.style.setProperty("--accent-h", p.light.primary.h);
                  root.style.setProperty("--accent-c", p.light.primary.c);
                  root.style.setProperty("--accent-l", p.light.primary.l);
                  root.style.setProperty("--dark-accent-h", p.dark.primary.h);
                  root.style.setProperty("--dark-accent-c", p.dark.primary.c);
                  root.style.setProperty("--dark-accent-l", p.dark.primary.l);
                  
                  if (p.light.primaryFg) {
                    var fgStr = "oklch(" + p.light.primaryFg.l + " " + p.light.primaryFg.c + " " + p.light.primaryFg.h + ")";
                    root.style.setProperty("--primary-foreground-override", fgStr);
                    root.style.setProperty("--sidebar-primary-foreground-override", fgStr);
                  }
                  if (p.dark.primaryFg) {
                    var darkFgStr = "oklch(" + p.dark.primaryFg.l + " " + p.dark.primaryFg.c + " " + p.dark.primaryFg.h + ")";
                    root.style.setProperty("--dark-primary-foreground-override", darkFgStr);
                  }
                  
                  if (p.light.bg) {
                    root.style.setProperty("--background-override", "oklch(" + p.light.bg.l + " " + p.light.bg.c + " " + p.light.bg.h + ")");
                  }
                  if (p.light.fg) {
                    root.style.setProperty("--foreground-override", "oklch(" + p.light.fg.l + " " + p.light.fg.c + " " + p.light.fg.h + ")");
                  }
                  if (p.dark.bg) {
                    root.style.setProperty("--dark-background-override", "oklch(" + p.dark.bg.l + " " + p.dark.bg.c + " " + p.dark.bg.h + ")");
                  }
                  if (p.dark.fg) {
                    root.style.setProperty("--dark-foreground-override", "oklch(" + p.dark.fg.l + " " + p.dark.fg.c + " " + p.dark.fg.h + ")");
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }
  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p className="text-error">{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
