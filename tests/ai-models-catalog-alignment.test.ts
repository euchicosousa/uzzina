import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  actionAIModels,
  isActionAIModelId,
  lunaModelId as appLunaId,
} from "../app/lib/action-ai-models";
import { publicAIModels } from "../app/lib/ai-model-registry";
import {
  aiModels,
  defaultAIModelId,
  findAIModel,
  lunaModelId as serverLunaId,
} from "../server/ai-model-catalog.js";

const sql = readFileSync(
  resolve(
    __dirname,
    "../supabase/migrations/20261107160000_single_ai_model_registry.sql",
  ),
  "utf8",
);

type SeedRow = {
  id: string;
  name: string;
  provider: string;
  level: number;
  inputRate: number;
  outputRate: number;
  isDefault: boolean;
};

function parseSeedRows(): SeedRow[] {
  const insert = sql.match(
    /INSERT INTO public\.ai_models[^)]*\)\s*VALUES([\s\S]*?)ON CONFLICT/,
  );
  if (!insert?.[1]) throw new Error("INSERT INTO public.ai_models not found");
  const rows: SeedRow[] = [];
  const rowPattern =
    /\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*(true|false),\s*(?:true|false)\s*\)/g;
  for (const m of insert[1].matchAll(rowPattern)) {
    rows.push({
      id: m[1]!,
      name: m[2]!,
      provider: m[3]!,
      level: Number(m[4]),
      inputRate: Number(m[5]),
      outputRate: Number(m[6]),
      isDefault: m[7] === "true",
    });
  }
  return rows;
}

describe("IA-M07: registro único de modelos de IA", () => {
  test("o app e o servidor usam o mesmo registro público", () => {
    expect(actionAIModels.map((m) => m.id)).toEqual(
      publicAIModels.map((m) => m.id),
    );
    expect(aiModels.map((m) => m.id)).toEqual(publicAIModels.map((m) => m.id));
    for (const [index, model] of aiModels.entries()) {
      const pub = publicAIModels[index]!;
      const app = actionAIModels[index]!;
      expect(model.name).toBe(pub.name);
      expect(model.provider).toBe(pub.provider);
      expect(model.level).toBe(pub.level);
      expect(app.name).toBe(pub.name);
      expect(app.provider).toBe(pub.provider);
      expect(app.level).toBe(pub.level);
    }
  });

  test("o modelo base (Luna) é único e coincide entre app e servidor", () => {
    expect(serverLunaId).toBe(defaultAIModelId);
    expect(appLunaId).toBe(defaultAIModelId);
    expect(findAIModel(defaultAIModelId)?.isDefault).toBe(true);
    expect(aiModels.filter((m) => m.isDefault)).toHaveLength(1);
    expect(isActionAIModelId(defaultAIModelId)).toBe(true);
  });

  test("todo modelo do catálogo tem tarifas e taxas de reserva válidas", () => {
    for (const model of aiModels) {
      expect(model.intents.length).toBeGreaterThan(0);
      expect(model.tariffs.length).toBeGreaterThan(0);
      expect(model.reservationRates.input).toBeGreaterThan(0);
      expect(model.reservationRates.output).toBeGreaterThan(0);
    }
  });

  test("o registro público e a lista do app não carregam tarifas nem taxas", () => {
    const forbidden = [
      "tariffs",
      "reservationRates",
      "intents",
      "capabilities",
    ];
    for (const model of [...publicAIModels, ...actionAIModels]) {
      for (const key of forbidden) expect(key in model).toBe(false);
    }
    const source = readFileSync(
      resolve(__dirname, "../app/lib/ai-model-registry.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/tariffs|reservationRates/);
    const appSource = readFileSync(
      resolve(__dirname, "../app/lib/action-ai-models.ts"),
      "utf8",
    );
    expect(appSource).not.toMatch(/server\//);
  });

  test("o INSERT da migration tem os mesmos modelos e valores do catálogo", () => {
    const rows = parseSeedRows();
    expect(rows.map((r) => r.id).sort()).toEqual(
      aiModels.map((m) => m.id).sort(),
    );
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
    for (const model of aiModels) {
      const row = rows.find((r) => r.id === model.id);
      expect(row).toBeDefined();
      expect(row?.name).toBe(model.name);
      expect(row?.provider).toBe(model.provider);
      expect(row?.level).toBe(model.level);
      expect(row?.inputRate).toBe(model.reservationRates.input);
      expect(row?.outputRate).toBe(model.reservationRates.output);
      expect(row?.isDefault).toBe(model.isDefault === true);
    }
  });

  test("update_my_preferences mantém a autorização de produção", () => {
    const start = sql.indexOf(
      "CREATE OR REPLACE FUNCTION public.update_my_preferences",
    );
    const body = sql.slice(start);
    expect(body).toContain("visible = true");
    expect(body).toContain("Active member required");
    expect(body).toContain("Unknown preference key");
    expect(body).toContain("SECURITY DEFINER");
    expect(body).toContain(
      "public.ai_models WHERE id = (v_value #>> '{}') AND enabled",
    );
    expect(body).toContain(
      "WHEN 'strategyModels', 'contentModels', 'captionModels' THEN",
    );
    expect(body).toContain("Invalid AI task models preference");
    expect(body).toContain("Invalid AI model in task models preference");
  });

  test("ai_models fica fechada ao navegador (só service_role lê)", () => {
    expect(sql).toMatch(/ENABLE ROW LEVEL SECURITY/);
    expect(sql).toMatch(
      /REVOKE ALL ON public\.ai_models FROM PUBLIC, anon, authenticated/,
    );
    expect(sql).toMatch(/GRANT SELECT ON public\.ai_models TO service_role;/);
    expect(sql).not.toMatch(/GRANT[^;]*ai_models[^;]*(anon|authenticated)/);
  });
});
