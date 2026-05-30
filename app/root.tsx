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
  // {
  //   rel: "preconnect",
  //   href: "https://fonts.googleapis.com",
  // },
  // {
  //   rel: "preconnect",
  //   href: "https://fonts.gstatic.com",
  //   crossOrigin: "anonymous",
  // },
  // {
  //   rel: "stylesheet",
  //   href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap",
  // },
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
                var root = document.documentElement;
                
                if (n === -1) {
                  // Função auxiliar inline hexToOklch (minificada e adaptada)
                  function h2o(hex) {
                    var cHex = hex.replace("#", "");
                    if (cHex.length === 3) {
                      cHex = cHex.split("").map(function(x) { return x + x; }).join("");
                    }
                    if (cHex.length !== 6) return { h: 0, c: 0, l: 0 };
                    var r = parseInt(cHex.substring(0, 2), 16) / 255;
                    var g = parseInt(cHex.substring(2, 4), 16) / 255;
                    var b = parseInt(cHex.substring(4, 6), 16) / 255;
                    
                    var rL = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
                    var gL = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
                    var bL = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
                    
                    var l_ = 0.4122214708 * rL + 0.5363337775 * gL + 0.0514459954 * bL;
                    var m_ = 0.2119034982 * rL + 0.6806995451 * gL + 0.1073970008 * bL;
                    var s_ = 0.0883024619 * rL + 0.2817188376 * gL + 0.6299787005 * bL;
                    
                    var lL = Math.cbrt(l_);
                    var mL = Math.cbrt(m_);
                    var sL = Math.cbrt(s_);
                    
                    var L = 0.2104542553 * lL + 0.793617785 * mL - 0.0040720468 * sL;
                    var a = 1.9779984951 * lL - 2.428592205 * mL + 0.4505937099 * sL;
                    var b_ = 0.0259040371 * lL + 0.7827717662 * mL - 0.808675766 * sL;
                    
                    var C = Math.sqrt(a * a + b_ * b_);
                    var H = Math.atan2(b_, a) * (180 / Math.PI);
                    if (H < 0) H += 360;
                    
                    return {
                      h: Math.round(H * 100) / 100,
                      c: Math.round(C * 1000) / 1000,
                      l: Math.round(L * 1000) / 1000
                    };
                  }
                  
                  var lp = localStorage.getItem("uzzina-custom-light-primary");
                  var lpfg = localStorage.getItem("uzzina-custom-light-primary-fg") || "#FFFFFF";
                  var lbg = localStorage.getItem("uzzina-custom-custom-light-bg") || localStorage.getItem("uzzina-custom-light-bg");
                  var lfg = localStorage.getItem("uzzina-custom-light-fg");
                  var dp = localStorage.getItem("uzzina-custom-dark-primary");
                  var dpfg = localStorage.getItem("uzzina-custom-dark-primary-fg") || "#FFFFFF";
                  var dbg = localStorage.getItem("uzzina-custom-dark-bg");
                  var dfg = localStorage.getItem("uzzina-custom-dark-fg");
                  
                  if (lp && lbg && lfg && dp && dbg && dfg) {
                    var lightP = h2o(lp);
                    var lightPfg = h2o(lpfg);
                    var lightBg = h2o(lbg);
                    var lightFg = h2o(lfg);
                    var darkP = h2o(dp);
                    var darkPfg = h2o(dpfg);
                    var darkBg = h2o(dbg);
                    var darkFg = h2o(dfg);
                    
                    root.style.setProperty("--accent-h", lightP.h);
                    root.style.setProperty("--accent-c", lightP.c);
                    root.style.setProperty("--accent-l", lightP.l);
                    root.style.setProperty("--dark-accent-h", darkP.h);
                    root.style.setProperty("--dark-accent-c", darkP.c);
                    root.style.setProperty("--dark-accent-l", darkP.l);
                    
                    root.style.setProperty("--primary-foreground-override", "oklch(" + lightPfg.l + " " + lightPfg.c + " " + lightPfg.h + ")");
                    root.style.setProperty("--sidebar-primary-foreground-override", "oklch(" + lightPfg.l + " " + lightPfg.c + " " + lightPfg.h + ")");
                    root.style.setProperty("--dark-primary-foreground-override", "oklch(" + darkPfg.l + " " + darkPfg.c + " " + darkPfg.h + ")");
                    
                    root.style.setProperty("--background-override", "oklch(" + lightBg.l + " " + lightBg.c + " " + lightBg.h + ")");
                    root.style.setProperty("--foreground-override", "oklch(" + lightFg.l + " " + lightFg.c + " " + lightFg.h + ")");
                    root.style.setProperty("--dark-background-override", "oklch(" + darkBg.l + " " + darkBg.c + " " + darkBg.h + ")");
                    root.style.setProperty("--dark-foreground-override", "oklch(" + darkFg.l + " " + darkFg.c + " " + darkFg.h + ")");
                  }
                } else if (!isNaN(n) && palette[n]) {
                  var p = palette[n];
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
