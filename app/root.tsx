import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { type LoaderFunctionArgs } from "react-router";

import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import { themeSessionResolver } from "./sessions.server";

import "./tailwind.css";
import { cn } from "./lib/utils";
import { PALLETE } from "./lib/CONSTANTS";

export const links: Route.LinksFunction = () => [
  // { rel: "stylesheet", href: "/object-sans/object-sans.css" },
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
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL!,
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY!,
    },
  };
}

export default function AppWithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
      <App />
    </ThemeProvider>
  );
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const { env } = data;
  const [theme] = useTheme();

  return (
    <html lang="pt-br" className={cn(theme)} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
        {/* Env vars públicas para o browser — apenas keys publishable (nunca service_role) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__env = ${JSON.stringify(env)};`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var palette = ${JSON.stringify(PALLETE)};
                var idx = localStorage.getItem("uzzina-accent-color-index");
                var n = (idx !== null && idx !== "") ? parseInt(idx, 10) : 0;
                if (!isNaN(n) && palette[n]) {
                  var p = palette[n];
                  var root = document.documentElement;
                  root.style.setProperty("--accent-h", p.light.primary.h);
                  root.style.setProperty("--accent-c", p.light.primary.c);
                  root.style.setProperty("--accent-l", p.light.primary.l);
                  root.style.setProperty("--dark-accent-h", p.dark.primary.h);
                  root.style.setProperty("--dark-accent-c", p.dark.primary.c);
                  root.style.setProperty("--dark-accent-l", p.dark.primary.l);

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
