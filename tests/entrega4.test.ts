import { describe, expect, it } from "bun:test";

describe("Entrega 4 - Item 4.9: Instagram: Stories vs Feed [24]", () => {
  it("diferencia conteúdo de rede social de inclusão na grade do feed", () => {
    const {
      isInstagramFeed,
      isSocialMediaContent,
    } = require("~/utils/validation");

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
});
