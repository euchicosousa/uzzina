export type ComposioConfiguration = {
  apiKey: string;
  instagramAuthConfigId: string;
};

export function getComposioConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): ComposioConfiguration {
  const apiKey = env.COMPOSIO_API_KEY?.trim();
  const instagramAuthConfigId = env.COMPOSIO_INSTAGRAM_AUTH_CONFIG_ID?.trim();
  const missing = [
    !apiKey && "COMPOSIO_API_KEY",
    !instagramAuthConfigId && "COMPOSIO_INSTAGRAM_AUTH_CONFIG_ID",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(
      `Missing Composio server configuration: ${missing.join(", ")}`,
    );
  }

  if (!apiKey || !instagramAuthConfigId) {
    throw new Error("Composio server configuration is incomplete.");
  }

  if (!/^ac_[A-Za-z0-9_-]+$/.test(instagramAuthConfigId)) {
    throw new Error(
      "COMPOSIO_INSTAGRAM_AUTH_CONFIG_ID must be an auth config ID (ac_...).",
    );
  }

  return { apiKey, instagramAuthConfigId };
}
