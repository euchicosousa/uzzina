export class PortalHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "PortalHttpError";
  }
}

export async function portalRequest<T>(
  url: string,
  options: RequestInit,
  message: string,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, credentials: "same-origin" });
  } catch {
    throw new PortalHttpError(
      503,
      "Não foi possível conectar ao portal. Tente novamente.",
    );
  }
  if (!response.ok) {
    throw new PortalHttpError(
      response.status,
      `${message}: status ${response.status}`,
    );
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new PortalHttpError(
      503,
      "O portal retornou uma resposta inválida. Tente novamente.",
    );
  }
}
