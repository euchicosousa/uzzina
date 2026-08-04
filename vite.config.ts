import { defineConfig, loadEnv, type Plugin } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

function apiAiDevPlugin(): Plugin {
  return {
    name: "api-ai-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.url === "/api/ai" && req.method === "POST") {
          try {
            // Carrega variáveis do arquivo .env no process.env para dev mode local
            const env = loadEnv("development", process.cwd(), "");
            Object.assign(process.env, env);

            let bodyStr = "";
            req.on("data", (chunk) => {
              bodyStr += chunk;
            });
            req.on("end", async () => {
              try {
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                // Carrega dinamicamente o handler da API de IA
                const aiHandlerModule = await server.ssrLoadModule("./api/ai.ts");
                const handler = aiHandlerModule.default;

                // Mock dos objetos VercelRequest e VercelResponse para dev local
                const mockReq = {
                  method: req.method,
                  body,
                  headers: req.headers,
                };

                let statusCode = 200;
                const mockRes = {
                  status(code: number) {
                    statusCode = code;
                    return mockRes;
                  },
                  json(data: unknown) {
                    res.statusCode = statusCode;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(data));
                    return mockRes;
                  },
                };

                await handler(mockReq, mockRes);
              } catch (err: unknown) {
                console.error("[dev-api-ai] Erro ao processar /api/ai localmente:", err);
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno no dev plugin." }));
              }
            });
          } catch (e) {
            next(e);
          }
          return;
        }
        next();
      });
    },
  };
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    apiAiDevPlugin(),
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
