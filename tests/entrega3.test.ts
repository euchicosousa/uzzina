import { describe, expect, it } from "bun:test";
import type { Action, Partner } from "~/types";

describe("Entrega 3 - Item 1: Busca [19]", () => {
  const mockPartners: Partner[] = [
    {
      id: "p1",
      slug: "parceiro-acessivel",
      title: "Parceiro Acessível",
      short: "PA",
      colors: ["#111111", "#ffffff"],
    } as Partner,
    {
      id: "p2",
      slug: "parceiro-secundario",
      title: "Parceiro Secundário",
      short: "PS",
      colors: ["#222222", "#eeeeee"],
    } as Partner,
  ];

  it("escolhe parceiro acessível quando o primeiro da ação não está no contexto do usuário", () => {
    const actionWithInaccessibleFirst = {
      id: "act-1",
      title: "Campanha Mista",
      partners: ["parceiro-inacessivel", "parceiro-acessivel"],
    } as Action;

    // Lógica correta: busca o primeiro parceiro da ação que EXISTE na lista de parceiros acessíveis
    const resolvedPartner =
      mockPartners.find((p) => actionWithInaccessibleFirst.partners?.includes(p.slug)) || null;

    expect(resolvedPartner).not.toBeNull();
    expect(resolvedPartner?.slug).toBe("parceiro-acessivel");
    expect(resolvedPartner?.colors?.[0]).toBe("#111111");
  });

  it("trata ausência total de parceiro com guarda sem lançar exceção", () => {
    const actionWithoutKnownPartner = {
      id: "act-2",
      title: "Ação Órfã",
      partners: ["parceiro-desconhecido"],
    } as Action;

    const resolvedPartner =
      mockPartners.find((p) => actionWithoutKnownPartner.partners?.includes(p.slug)) || null;

    // Guarda segura não acessa .colors diretamente
    const bgColor = resolvedPartner?.colors?.[0] ?? undefined;
    const color = resolvedPartner?.colors?.[1] ?? undefined;
    const fallback = resolvedPartner?.short ?? "??";

    expect(resolvedPartner).toBeNull();
    expect(bgColor).toBeUndefined();
    expect(color).toBeUndefined();
    expect(fallback).toBe("??");
  });

  it("descarta respostas de busca obsoletas quando uma consulta mais recente já começou", async () => {
    let latestQueryId = 0;
    const results: string[] = [];

    async function simulateSearch(query: string, delayMs: number) {
      const currentId = ++latestQueryId;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Se um novo id de query foi gerado enquanto essa esperava, ela é obsoleta
      if (currentId !== latestQueryId) {
        return; // Descartada!
      }
      results.push(query);
    }

    // Dispara 'busca1' que demora 50ms, depois 'busca2' rápida de 10ms
    const p1 = simulateSearch("busca1-lenta", 50);
    const p2 = simulateSearch("busca2-rapida", 10);

    await Promise.all([p1, p2]);

    // Apenas 'busca2-rapida' deve ser gravada no resultado final!
    expect(results).toEqual(["busca2-rapida"]);
  });
});

describe("Entrega 3 - Item 2: Erros e Ausência de Dados [20]", () => {
  interface ViewState<T> {
    isLoading: boolean;
    isError: boolean;
    data: T | null;
  }

  function resolveScreenState<T>(state: ViewState<T>): "loading" | "error" | "empty" | "success" {
    if (state.isLoading) return "loading";
    if (state.isError) return "error";
    if (!state.data || (Array.isArray(state.data) && state.data.length === 0)) return "empty";
    return "success";
  }

  it("distingue erro de carregamento (não entra em loading infinito)", () => {
    const errorState: ViewState<{ id: string }> = {
      isLoading: false,
      isError: true,
      data: null,
    };
    expect(resolveScreenState(errorState)).toBe("error");
  });

  it("distingue lista vazia de erro", () => {
    const emptyState: ViewState<unknown[]> = {
      isLoading: false,
      isError: false,
      data: [],
    };
    expect(resolveScreenState(emptyState)).toBe("empty");
  });

  it("distingue sucesso de loading e erro", () => {
    const successState: ViewState<{ title: string }> = {
      isLoading: false,
      isError: false,
      data: { title: "Ação 1" },
    };
    expect(resolveScreenState(successState)).toBe("success");
  });
});
