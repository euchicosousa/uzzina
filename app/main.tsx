import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { PALLETE } from "./lib/palettes";
import { applyPaletteVars } from "./lib/palette-vars";
import { getRouter } from "./router";
import "./tailwind.css";

// Every layer variable comes from the data before the first render (DS36):
// tailwind.css only reads them. useAppTheme then applies the user's palette.
applyPaletteVars(PALLETE[0]);

const router = getRouter();

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
