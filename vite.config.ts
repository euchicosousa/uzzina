import { defineConfig, loadEnv, type Plugin } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createDevApiMiddleware } from "./server/dev-api";

function localApiPlugin(): Plugin {
  return {
    name: "local-serverless-api",
    configureServer(server) {
      Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ""));
      if (server.config.mode === "development") {
        process.env.UZZINA_LOCAL_AI_COMPAT = "true";
        console.warn("[UZZINA] Compatibilidade de IA local ativa; quota persistente não aplicada neste modo.");
      } else {
        process.env.UZZINA_LOCAL_AI_COMPAT = "false";
      }
      server.middlewares.use(createDevApiMiddleware(async (path) => {
        const module = await server.ssrLoadModule(path);
        return module.default;
      }));
    },
  };
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    localApiPlugin(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
    }),
    viteReact(),
    tailwindcss(),
  ],
});

export default config;
