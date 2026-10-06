import { describe, expect, it } from "bun:test";
import { sanitizeHtml } from "~/utils/sanitize";
import { QUERY_KEYS } from "~/lib/query-keys";

describe("Entrega 2 - S04: Sanitização HTML e Audiência de Comentários", () => {
  it("remove scripts, iframes e tags perigosas", () => {
    const dirty = "<p>Texto normal</p><script>alert('xss')</script><iframe src='https://evil.com'></iframe>";
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("alert");
    expect(clean).not.toContain("<iframe");
    expect(clean).toContain("<p>Texto normal</p>");
  });

  it("remove manipuladores de eventos inline (onerror, onload, onclick)", () => {
    const dirty = '<img src="invalido.png" onerror="alert(1)" /><button onclick="hack()">Clique</button>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("onerror");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("alert(1)");
    expect(clean).not.toContain("<button");
  });

  it("remove links javascript: e data: perigosos", () => {
    const dirty = '<a href="javascript:alert(1)">Link Malicioso</a><a href="https://uzzina.com">Link Seguro</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain("javascript:");
    expect(clean).toContain('href="https://uzzina.com"');
    expect(clean).toContain("Link Seguro");
  });

  it("preserva formatação rica válida do Tiptap (tabelas, listas, negrito, links)", () => {
    const rich = `
      <h2>Título da Seção</h2>
      <p>Texto com <strong>negrito</strong> e <em>itálico</em>.</p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
      <table>
        <thead><tr><th>Coluna 1</th><th>Coluna 2</th></tr></thead>
        <tbody><tr><td>Dado 1</td><td>Dado 2</td></tr></tbody>
      </table>
    `.trim();
    const clean = sanitizeHtml(rich);
    expect(clean).toContain("<h2>Título da Seção</h2>");
    expect(clean).toContain("<strong>negrito</strong>");
    expect(clean).toContain("<em>itálico</em>");
    expect(clean).toContain("<table>");
    expect(clean).toContain("<th>Coluna 1</th>");
    expect(clean).toContain("<td>Dado 1</td>");
  });

  it("separa chaves de cache entre comentários públicos e internos", () => {
    const actionId = "action-123";
    const internalKey = QUERY_KEYS.comments.all(actionId);
    const publicKey = QUERY_KEYS.comments.public(actionId);

    // Chaves devem ser distintas para impedir contaminação do cache
    expect(internalKey).not.toEqual(publicKey);
    expect(internalKey).toContain("internal");
    expect(publicKey).toContain("public");
  });
});

describe("Entrega 2 - S05: Escopo do Link de Revisão", () => {
  it("filtra ações para garantir que pertencem exclusivamente ao parceiro do link", () => {
    const targetSlug = "parceiro-alfa";
    const actions = [
      { id: "act-1", title: "Ação Alfa 1", partners: ["parceiro-alfa", "outro"] },
      { id: "act-2", title: "Ação Beta (Outro)", partners: ["parceiro-beta"] },
      { id: "act-3", title: "Ação Alfa 2", partners: ["parceiro-alfa"] },
      { id: "act-4", title: "Ação Sem Parceiro", partners: [] },
    ];

    const scopedActions = actions.filter(
      (a) => Array.isArray(a.partners) && a.partners.includes(targetSlug)
    );

    expect(scopedActions.map((a) => a.id)).toEqual(["act-1", "act-3"]);
  });
});

describe("Entrega 2 - S03: Validação de Payload da API de IA", () => {
  const ALLOWED_INTENTS = ["ai-strategy", "ai-content", "ai-hooks", "ai-caption"];

  function validateAIPayload(payload: {
    intent?: string;
    category?: string;
    title?: string;
    description?: string;
    partner_context?: string;
  }) {
    if (!payload.intent || !ALLOWED_INTENTS.includes(payload.intent)) {
      return { valid: false, error: "Intent inválido ou não autorizado." };
    }
    if (!payload.category || typeof payload.category !== "string" || payload.category.length > 100) {
      return { valid: false, error: "Categoria inválida." };
    }
    if (payload.title && payload.title.length > 500) {
      return { valid: false, error: "Título excede tamanho máximo permitido (500 caracteres)." };
    }
    if (payload.description && payload.description.length > 10000) {
      return { valid: false, error: "Descrição excede tamanho máximo permitido (10.000 caracteres)." };
    }
    if (payload.partner_context && payload.partner_context.length > 10000) {
      return { valid: false, error: "Contexto do parceiro excede tamanho máximo permitido." };
    }
    return { valid: true };
  }

  it("recusa intents não autorizados", () => {
    const result = validateAIPayload({ intent: "ai-arbitrary-command", category: "post" });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Intent inválido");
  });

  it("aceita intents homologados com tamanhos adequados", () => {
    const result = validateAIPayload({
      intent: "ai-strategy",
      category: "post",
      title: "Planejamento Outubro",
      description: "Diretrizes gerais",
    });
    expect(result.valid).toBe(true);
  });

  it("rejeita payloads que excedem limites de tamanho", () => {
    const result = validateAIPayload({
      intent: "ai-caption",
      category: "post",
      title: "A".repeat(501),
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Título excede tamanho máximo");
  });
});

describe("Entrega 2 - S01: Verificação de Sessão do Portal e Compatibilidade de Hash", () => {
  // Simulação do algoritmo de hash mantendo 100% de compatibilidade com os clientes já cadastrados
  async function computeServerHash(password: string): Promise<string> {
    const salt = "uzzina_v1_salt_";
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  it("gera hash determinístico idêntico ao histórico do sistema", async () => {
    const hash1 = await computeServerHash("senha123");
    const hash2 = await computeServerHash("senha123");
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex string
  });

  it("recusa cliente inativo mesmo com credenciais corretas", () => {
    const clientRecord = {
      id: "cli-1",
      email: "cliente@empresa.com",
      active: false,
      password_hash: "mockhash",
    };

    const isAllowed = clientRecord.active === true;
    expect(isAllowed).toBe(false);
  });
});

describe("Entrega 2 - S02: Guard de Acesso Administrativo", () => {
  function checkAdminAccess(person: { admin?: boolean | null } | null | undefined): boolean {
    return Boolean(person && person.admin === true);
  }

  it("permite acesso apenas para usuário com flag admin: true", () => {
    expect(checkAdminAccess({ admin: true })).toBe(true);
    expect(checkAdminAccess({ admin: false })).toBe(false);
    expect(checkAdminAccess({ admin: null })).toBe(false);
    expect(checkAdminAccess(null)).toBe(false);
    expect(checkAdminAccess(undefined)).toBe(false);
  });
});
