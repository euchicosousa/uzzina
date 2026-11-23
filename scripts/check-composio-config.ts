import { loadEnv } from "vite";
import { getComposioConfiguration } from "../server/composio-config";

const env = { ...process.env, ...loadEnv("production", process.cwd(), "") };

try {
  getComposioConfiguration(env);
  console.log(
    "Composio server configuration is present (values not displayed).",
  );
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Invalid Composio configuration.";
  console.error(message);
  process.exitCode = 1;
}
