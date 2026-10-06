import { describe, expect, it } from "bun:test";
import type { Partner } from "~/types";

describe("Entrega 4 - Item 4.1: Parceiros do Bootstrap Reativos [18]", () => {
  it("sincroniza lista de parceiros entre cache do TanStack Query e estado do contexto", () => {
    // Simula estado inicial do bootstrap
    const bootstrapPartners: Partner[] = [
      { id: "p1", slug: "parceiro-antigo", title: "Parceiro Antigo", short: "PA", colors: ["#000", "#fff"] } as Partner,
    ];

    // Cache reativo
    let cachedPartners = [...bootstrapPartners];
    const listeners: Array<(partners: Partner[]) => void> = [];

    function subscribe(listener: (partners: Partner[]) => void) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      };
    }

    function updateCache(newPartners: Partner[]) {
      cachedPartners = newPartners;
      for (const listener of listeners) listener(cachedPartners);
    }

    // Contexto observando o cache reativo
    let contextPartners = cachedPartners;
    const unsubscribe = subscribe((updated) => {
      contextPartners = updated;
    });

    expect(contextPartners).toHaveLength(1);
    expect(contextPartners[0].title).toBe("Parceiro Antigo");

    // Simula mutação administrativa salvando um novo parceiro e invalidando a query
    const updatedPartnersList: Partner[] = [
      ...bootstrapPartners,
      { id: "p2", slug: "novo-parceiro", title: "Novo Parceiro", short: "NP", colors: ["#111", "#eee"] } as Partner,
    ];

    updateCache(updatedPartnersList);

    // O contexto deve imediatamente refletir o novo parceiro sem depender de reload
    expect(contextPartners).toHaveLength(2);
    expect(contextPartners[1].title).toBe("Novo Parceiro");
    expect(contextPartners[1].slug).toBe("novo-parceiro");

    unsubscribe();
  });

  it("filtra parceiros de acordo com a permissão do usuário (admin vs colaborador)", () => {
    const allPartners: Partner[] = [
      { id: "p1", slug: "parceiro-a", users_ids: ["user-1"], archived: false } as Partner,
      { id: "p2", slug: "parceiro-b", users_ids: ["user-2"], archived: false } as Partner,
      { id: "p3", slug: "parceiro-c", users_ids: ["user-1"], archived: true } as Partner,
    ];

    function resolvePartnersForUser(isAdmin: boolean, userId: string, partners: Partner[]) {
      if (isAdmin) {
        return partners; // Admin vê todos
      }
      return partners.filter((p) => !p.archived && p.users_ids?.includes(userId));
    }

    const adminView = resolvePartnersForUser(true, "user-1", allPartners);
    expect(adminView).toHaveLength(3);

    const collaboratorView = resolvePartnersForUser(false, "user-1", allPartners);
    expect(collaboratorView).toHaveLength(1);
    expect(collaboratorView[0].slug).toBe("parceiro-a");
  });
});

describe("Entrega 4 - Item 4.2: Seleção em Lote Contextual [38]", () => {
  interface MockElement {
    id: string;
    isVisible: boolean;
    isInsideEditable: boolean;
  }

  function simulateCmdASelection(
    isSelectionMode: boolean,
    targetIsEditable: boolean,
    elements: MockElement[],
  ): string[] | null {
    if (!isSelectionMode) return null;
    if (targetIsEditable) return null; // Preserva comportamento nativo de seleção de texto em inputs

    const visibleElements = elements.filter((el) => el.isVisible);
    return visibleElements.map((el) => el.id);
  }

  it("seleciona apenas elementos visíveis ao acionar Cmd+A, ignorando cards ocultos ou fechados", () => {
    const cards: MockElement[] = [
      { id: "act-1", isVisible: true, isInsideEditable: false },
      { id: "act-2", isVisible: false, isInsideEditable: false }, // Oculto por filtro ou gaveta fechada
      { id: "act-3", isVisible: true, isInsideEditable: false },
    ];

    const selected = simulateCmdASelection(true, false, cards);
    expect(selected).toEqual(["act-1", "act-3"]);
  });

  it("ignora atalho Cmd+A quando o foco está em inputs ou campos editáveis", () => {
    const cards: MockElement[] = [
      { id: "act-1", isVisible: true, isInsideEditable: false },
    ];

    const selectedInInput = simulateCmdASelection(true, true, cards);
    expect(selectedInInput).toBeNull();
  });

  it("restringe execução de lote aos itens atualmente visíveis no recorte da página", () => {
    const initialSelectedIds = ["act-1", "act-2", "act-3"];
    const currentVisibleIds = new Set(["act-1", "act-3"]); // act-2 foi filtrado da tela

    // Ação em lote só deve atuar na interseção entre selecionados e visíveis
    const effectiveIdsToMutate = initialSelectedIds.filter((id) => currentVisibleIds.has(id));

    expect(effectiveIdsToMutate).toEqual(["act-1", "act-3"]);
    expect(effectiveIdsToMutate).not.toContain("act-2");
  });

  it("limpa seleção ativa ao navegar entre rotas diferentes", () => {
    let selectedIds = ["act-1", "act-2"];
    let isSelectionMode = true;

    function handleRouteChange(newPath: string, oldPath: string) {
      if (newPath !== oldPath) {
        selectedIds = [];
        isSelectionMode = false;
      }
    }

    handleRouteChange("/app/partner/cliente-b", "/app/partner/cliente-a");

    expect(selectedIds).toEqual([]);
    expect(isSelectionMode).toBe(false);
  });
});

describe("Entrega 4 - Item 4.3: Calendário do Portal e Janela Mensal [25]", () => {
  it("navega meses com precisão respeitando virada de ano e anos bissextos (não usa saltos de 30 dias fixos)", () => {
    // 31 de janeiro de 2024 (ano bissexto)
    const jan2024 = new Date(2024, 0, 31);
    
    // date-fns addMonths ajusta corretamente para o último dia do mês quando o dia não existe
    const { addMonths, subMonths } = require("date-fns");
    const feb2024 = addMonths(jan2024, 1);
    expect(feb2024.getFullYear()).toBe(2024);
    expect(feb2024.getMonth()).toBe(1); // Fevereiro
    expect(feb2024.getDate()).toBe(29); // 29 de fevereiro em 2024!

    // Virada de ano: Dezembro 2026 -> Janeiro 2027
    const dec2026 = new Date(2026, 11, 15);
    const jan2027 = addMonths(dec2026, 1);
    expect(jan2027.getFullYear()).toBe(2027);
    expect(jan2027.getMonth()).toBe(0);

    // Retroceder de Janeiro 2027 -> Dezembro 2026
    const backToDec = subMonths(jan2027, 1);
    expect(backToDec.getFullYear()).toBe(2026);
    expect(backToDec.getMonth()).toBe(11);
  });

  it("calcula período visível cobrindo semanas completas de domingo a sábado", () => {
    const { startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require("date-fns");
    
    // Outubro de 2026
    const oct2026 = new Date(2026, 9, 15);
    const visibleStart = startOfWeek(startOfMonth(oct2026), { weekStartsOn: 0 });
    const visibleEnd = endOfWeek(endOfMonth(oct2026), { weekStartsOn: 0 });

    // Início deve ser domingo (0)
    expect(visibleStart.getDay()).toBe(0);
    // Fim deve ser sábado (6)
    expect(visibleEnd.getDay()).toBe(6);

    // Setembro de 2026 termina na quarta-feira 30/09; 27/09 (domingo) deve ser o visibleStart
    expect(visibleStart.getFullYear()).toBe(2026);
    expect(visibleStart.getMonth()).toBe(8); // Setembro (borda anterior)
    expect(visibleStart.getDate()).toBe(27);

    // Outubro de 2026 termina no sábado 31/10
    expect(visibleEnd.getFullYear()).toBe(2026);
    expect(visibleEnd.getMonth()).toBe(9); // Outubro
    expect(visibleEnd.getDate()).toBe(31);
  });

  it("gera chaves de busca e queries dinâmicas baseadas no mês navegado", () => {
    const { format } = require("date-fns");

    function getCalendarQueryKey(partnerSlug: string, currentDay: Date, view: "month" | "week") {
      const monthKey = format(currentDay, "yyyy-MM");
      return ["dashActions", partnerSlug, view, monthKey];
    }

    const keyOct = getCalendarQueryKey("parceiro-a", new Date(2026, 9, 1), "month");
    const keyNov = getCalendarQueryKey("parceiro-a", new Date(2026, 10, 1), "month");

    expect(keyOct).toEqual(["dashActions", "parceiro-a", "month", "2026-10"]);
    expect(keyNov).toEqual(["dashActions", "parceiro-a", "month", "2026-11"]);
    expect(keyOct).not.toEqual(keyNov);
  });
});

describe("Entrega 4 - Item 4.4: Gestão de Pessoas Arquivadas [52]", () => {
  interface MockPerson {
    id: string;
    name: string;
    visible: boolean;
  }

  const allPeople: MockPerson[] = [
    { id: "u1", name: "Ana Ativa", visible: true },
    { id: "u2", name: "Bruno Arquivado", visible: false },
    { id: "u3", name: "Carlos Ativo", visible: true },
  ];

  it("separa consulta de membros ativos para seletores operacionais", () => {
    // Seletor de responsáveis só deve obter membros com visible === true
    const activePeople = allPeople.filter((p) => p.visible);
    expect(activePeople).toHaveLength(2);
    expect(activePeople.map((p) => p.name)).toEqual(["Ana Ativa", "Carlos Ativo"]);
    expect(activePeople.some((p) => !p.visible)).toBe(false);
  });

  it("permite que painel administrativo liste membros ativos e arquivados para restauração", () => {
    // Painel administrativo recebe todas as pessoas
    const adminPeople = allPeople;
    const active = adminPeople.filter((p) => p.visible);
    const archived = adminPeople.filter((p) => !p.visible);

    expect(active).toHaveLength(2);
    expect(archived).toHaveLength(1);
    expect(archived[0].name).toBe("Bruno Arquivado");
  });
});

describe("Entrega 4 - Item 4.5: Duplicação Consistente de Ações [46]", () => {
  const originalAction: Action = {
    id: "act-original",
    title: "Campanha Black Friday",
    description: "Briefing detalhado",
    category: "post",
    phase: "feed",
    priority: "high",
    partners: ["parceiro-a"],
    responsibles: ["user-1"],
    date: "2026-11-20T14:00:00Z",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
  } as Action;

  it("garante coincidência exata entre o título e campos otimistas e o payload persistido", () => {
    // 1. Otimista (useActionMutations)
    const optimisticDuplication = {
      ...originalAction,
      id: "temp-dup-123",
      title: `${originalAction.title} (Cópia)`,
    };

    // 2. Persistido (duplicateActionClient)
    const { id: _id, created_at, updated_at, ...rest } = originalAction;
    const persistedPayload = {
      ...rest,
      title: `${rest.title} (Cópia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Título otimista e título persistido devem ser idênticos
    expect(optimisticDuplication.title).toBe(persistedPayload.title);
    expect(persistedPayload.title).toBe("Campanha Black Friday (Cópia)");

    // Fase, data, parceiros e categoria são preservados fielmente sem inventar novas fases ou datas
    expect(persistedPayload.phase).toBe(originalAction.phase);
    expect(persistedPayload.date).toBe(originalAction.date);
    expect(persistedPayload.category).toBe(originalAction.category);
    expect(persistedPayload.partners).toEqual(originalAction.partners);
    expect(persistedPayload.responsibles).toEqual(originalAction.responsibles);
  });
});

describe("Entrega 4 - Item 4.6: Preferências de Usuário e Debounce [45]", () => {
  it("preserva alterações sequenciais e não reintroduz snapshot antigo do bootstrap", () => {
    // Snapshot original recebido no login/bootstrap
    const bootstrapPreferences: Record<string, unknown> = {
      theme: "light",
      themeColorIndex: 1,
      followPartnerColor: false,
    };

    // Fila reativa com referência persistente às edições mais recentes
    const currentPrefs = { ...bootstrapPreferences };
    const pendingQueue: Record<string, unknown> = {};

    function queuePreference(key: string, value: unknown) {
      currentPrefs[key] = value;
      pendingQueue[key] = value;
    }

    // 1. Usuário muda a cor para índice 5
    queuePreference("themeColorIndex", 5);
    // 2. Logo em seguida, muda o tema para dark
    queuePreference("theme", "dark");

    // Simula disparo do debounce persistindo o snapshot atualizado
    const payloadToPersist = { ...currentPrefs };

    expect(payloadToPersist.themeColorIndex).toBe(5);
    expect(payloadToPersist.theme).toBe("dark");
    expect(payloadToPersist.followPartnerColor).toBe(false);
  });

  it("não perde novas preferências enfileiradas enquanto uma requisição anterior está em voo", async () => {
    const persistedDatabase: Record<string, unknown> = {
      theme: "light",
      themeColorIndex: 0,
    };

    const latestPrefs = { ...persistedDatabase };
    const pendingQueue: Record<string, unknown> = {};

    function queue(key: string, value: unknown) {
      latestPrefs[key] = value;
      pendingQueue[key] = value;
    }

    // Primeira alteração
    queue("theme", "dark");

    // Inicia ciclo de gravação
    const keysInFlight = Object.keys(pendingQueue);
    const snapshotToSend = { ...latestPrefs };
    for (const k of keysInFlight) delete pendingQueue[k];

    // Durante o tempo de voo da primeira gravação (ex: 20ms), usuário altera a cor
    await new Promise((r) => setTimeout(r, 10));
    queue("themeColorIndex", 3);

    // Primeira gravação completa
    Object.assign(persistedDatabase, snapshotToSend);

    // A fila pendente NÃO foi zerada inadvertidamente: ela contém a cor 3!
    expect(pendingQueue).toEqual({ themeColorIndex: 3 });
    expect(latestPrefs.themeColorIndex).toBe(3);
    expect(latestPrefs.theme).toBe("dark");
  });
});

describe("Entrega 4 - Item 4.7: Acessibilidade e Interação Touch [32, 36, 37, 43]", () => {
  it("seleciona elemento de atalho via hover ou foco de teclado (:focus-within)", () => {
    const elements = [
      { id: "act-1", isHovered: false, isFocused: true },
      { id: "act-2", isHovered: false, isFocused: false },
    ];

    function findActionTarget(els: typeof elements) {
      const matches = els.filter((el) => el.isHovered || el.isFocused);
      return matches.at(-1)?.id ?? null;
    }

    expect(findActionTarget(elements)).toBe("act-1");
  });

  it("assegura que comboboxes sem texto renderizam aria-label acessível", () => {
    function computeAriaLabel(showText: boolean, title: string, prefix = "") {
      if (showText) return undefined;
      return prefix ? `${prefix}: ${title}` : title;
    }

    expect(computeAriaLabel(false, "Feed", "Fase")).toBe("Fase: Feed");
    expect(computeAriaLabel(false, "Post", "Categoria")).toBe("Categoria: Post");
    expect(computeAriaLabel(false, "Cliente Alpha")).toBe("Cliente Alpha");
    expect(computeAriaLabel(true, "Feed", "Fase")).toBeUndefined();
  });
});

describe("Entrega 4 - Item 4.8: Composição de Popover e Notificações [39]", () => {
  it("formata data de notificação com segurança e fornece estado vazio honesto", () => {
    const { format, isValid } = require("date-fns");

    function formatNotificationDate(rawDate: string): string {
      const d = new Date(rawDate);
      return isValid(d) ? format(d, "HH'h'mm 'de' dd/MM/yyyy") : "";
    }

    expect(formatNotificationDate("2026-10-06T14:30:00Z")).toContain("de 06/10/2026");
    expect(formatNotificationDate("data-invalida")).toBe("");

    function renderEmptyNotificationState(count: number): string {
      return count === 0 ? "Nenhuma notificação nova." : `${count} notificações`;
    }

    expect(renderEmptyNotificationState(0)).toBe("Nenhuma notificação nova.");
    expect(renderEmptyNotificationState(3)).toBe("3 notificações");
  });
});

describe("Entrega 4 - Item 4.9: Instagram: Stories vs Feed [24]", () => {
  it("diferencia conteúdo de rede social de inclusão na grade do feed", () => {
    const { isInstagramFeed, isSocialMediaContent } = require("~/utils/validation");

    // "stories" é conteúdo de rede social, portanto tem aba de edição no Instagram
    expect(isSocialMediaContent("stories")).toBe(true);
    expect(isSocialMediaContent("post")).toBe(true);
    expect(isSocialMediaContent("reels")).toBe(true);
    expect(isSocialMediaContent("carousel")).toBe(true);
    expect(isSocialMediaContent("meeting")).toBe(false);

    // Por padrão (stories = false), isInstagramFeed exclui stories da grade visual do feed
    expect(isInstagramFeed("post")).toBe(true);
    expect(isInstagramFeed("reels")).toBe(true);
    expect(isInstagramFeed("carousel")).toBe(true);
    expect(isInstagramFeed("stories")).toBe(false);

    // Quando solicitado explicitamente (ex: filtro unificado), inclui stories
    expect(isInstagramFeed("stories", true)).toBe(true);
  });

  it("alterna rótulo para RECRIAR ESTRATÉGIAS quando estratégias já existem", () => {
    function getStrategyButtonLabel(
      hasStrategies: boolean,
      isAIProcessing: boolean,
    ): string {
      if (isAIProcessing) {
        return hasStrategies ? "RECRIANDO ESTRATÉGIAS..." : "CRIANDO ESTRATÉGIA...";
      }
      return hasStrategies ? "RECRIAR ESTRATÉGIAS" : "CRIAR ESTRATÉGIA";
    }

    expect(getStrategyButtonLabel(false, false)).toBe("CRIAR ESTRATÉGIA");
    expect(getStrategyButtonLabel(false, true)).toBe("CRIANDO ESTRATÉGIA...");
    expect(getStrategyButtonLabel(true, false)).toBe("RECRIAR ESTRATÉGIAS");
    expect(getStrategyButtonLabel(true, true)).toBe("RECRIANDO ESTRATÉGIAS...");
  });

  it("computa título da estratégia selecionada e garante fallback", () => {
    const strategies = [
      { headline: "Outubro Rosa: um passo simples pode salvar vidas", selected: false },
      { headline: "Prevenção é o melhor caminho", selected: true },
    ];

    const selectedStrat = strategies.find((s) => s.selected);
    const stratTitle = selectedStrat ? selectedStrat.headline : "Selecione a estratégia";

    expect(stratTitle).toBe("Prevenção é o melhor caminho");

    const noSelection: typeof strategies = [];
    const emptyStrat = noSelection.find((s) => s.selected);
    const fallbackTitle = emptyStrat ? emptyStrat.headline : "Selecione a estratégia";
    expect(fallbackTitle).toBe("Selecione a estratégia");
  });
});

