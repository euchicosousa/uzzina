import { createHash, randomUUID } from "node:crypto";
import {
  buildPlanningPeriodSlots,
  PLANNING_PERIOD_BATCH_SIZE,
} from "../app/lib/social-planning/period-plan.js";
import {
  normalizePlanningFormats,
  validatePeriodInput,
} from "../app/lib/social-planning/slot-calculator.js";
import {
  periodOperationSchema,
  periodPlanningResultSchema,
  periodProgressSchema,
  type PeriodPlanningInput,
} from "../app/lib/social-planning/theme-contract.js";
import type { Database } from "../types/database";
import { generateAI } from "./ai-generation.js";
import {
  aiOutputLimits,
  defaultAIModelId,
  findAIModel,
} from "./ai-model-catalog.js";
import { recordAIUsage } from "./ai-usage.js";
import type { createServiceClient } from "./supabase-admin.js";

type Client = ReturnType<typeof createServiceClient>;
type Operation = Database["public"]["Tables"]["planning_theme_requests"]["Row"];
type PartnerSource = Pick<
  Database["public"]["Tables"]["partners"]["Row"],
  "slug" | "title" | "context" | "voice"
>;

const intent = "ai-planning-period";
const maxBatchAge = 4 * 60_000;
const unavailable = "Não foi possível verificar a geração. Tente novamente.";
const periodChanged =
  "A composição do período mudou. Recarregue a página, confira a prévia e gere novamente.";

export function operationMode(operation: Operation) {
  const input = operation.input;
  return input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    input.planningMode === "period"
    ? "period"
    : "theme";
}

export async function preparePlanningPeriod(
  client: Client,
  request: PeriodPlanningInput,
  partner: PartnerSource,
  model: string,
) {
  const validated = validatePeriodInput(request);
  if (!validated.isValid) {
    return { status: 400, error: validated.error ?? periodChanged };
  }

  const regularCount = validated.calculatedSlots.length;
  const counts = request.formatCounts;
  const expectedCounts = normalizePlanningFormats(
    regularCount,
    request.formatMode === "manual" ? counts : null,
  );
  if (
    counts.reduce((sum, count) => sum + count, 0) !== regularCount ||
    counts.some((count, index) => count !== expectedCounts[index])
  ) {
    return { status: 409, error: periodChanged };
  }

  const ids = request.considerHolidays
    ? [...new Set(request.selectedCelebrationIds)]
    : [];
  const queries = [];
  for (let index = 0; index < ids.length; index += 50) {
    queries.push(
      client
        .from("celebrations")
        .select("id,date,title")
        .in("id", ids.slice(index, index + 50))
        .gte("date", request.startDate)
        .lte("date", request.endDate),
    );
  }
  const results = await Promise.all(queries);
  if (results.some((response) => response.error)) {
    return {
      status: 503,
      error: "Não foi possível conferir as datas comemorativas agora.",
    };
  }
  const celebrations = results.flatMap((response) => response.data ?? []);
  if (celebrations.length !== ids.length)
    return { status: 409, error: periodChanged };

  const slots = buildPlanningPeriodSlots(
    {
      slots: validated.calculatedSlots,
      celebrations,
      selectedCelebrationIds: ids,
      startDate: request.startDate,
      endDate: request.endDate,
    },
    counts,
  );
  if (
    slots.length !== request.expectedSlots.length ||
    slots.some((slot, index) => {
      const expected = request.expectedSlots[index];
      return (
        slot.date !== expected.date ||
        slot.format !== expected.format ||
        slot.isExtra !== expected.isExtra ||
        slot.isCommemorative !== expected.isCommemorative ||
        slot.celebrationTitle !== expected.celebrationTitle
      );
    })
  ) {
    return { status: 409, error: periodChanged };
  }

  const editorialSource = {
    marca: partner.title.trim(),
    contexto: partner.context,
    tom_de_voz: partner.voice,
  };
  if (
    !editorialSource.marca ||
    editorialSource.marca.length > 500 ||
    Buffer.byteLength(
      JSON.stringify([editorialSource, request.direction]),
      "utf8",
    ) > 50000
  ) {
    return {
      status: 422,
      error:
        "Confira o nome, o contexto, o tom de voz e o tamanho do Direcionamento.",
    };
  }

  return {
    input: {
      planningMode: "period",
      startDate: request.startDate,
      endDate: request.endDate,
      postsPerWeek: request.postsPerWeek,
      selectedDays: [...new Set(request.selectedDays)],
      periodDirection: request.direction,
      formatMode: request.formatMode,
      staticCount: counts[0],
      carouselCount: counts[1],
      reelsCount: counts[2],
      considerHolidays: request.considerHolidays,
      selectedCelebrationIds: ids,
      generationSlots: slots,
      generationModel: model,
      editorialSource,
    },
  };
}

type BatchOutcome =
  | { operation: Operation }
  | {
      status: number;
      body: {
        state?: "failed" | "running" | "queued";
        error?: string;
        progress?: number;
        total?: number;
      };
    };

function batchMeterId(id: string, offset: number) {
  const bytes = createHash("sha256")
    .update(`${id}:${offset}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
}

export async function runPlanningPeriodBatch(
  client: Client,
  initial: Operation,
): Promise<BatchOutcome> {
  if (initial.batch_started_at) {
    return Date.now() - Date.parse(initial.batch_started_at) >= maxBatchAge
      ? {
          status: 502,
          body: {
            state: "failed",
            error:
              "O último lote não pôde ser confirmado. Gere uma nova proposta.",
          },
        }
      : { status: 202, body: { state: "running" } };
  }

  const input = periodOperationSchema.safeParse(initial.input);
  if (!input.success) return { status: 503, body: { error: unavailable } };
  const model = findAIModel(input.data.generationModel);
  if (
    !model?.intents.includes(intent) ||
    !(model.provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY)
  ) {
    return {
      status: 503,
      body: {
        error: "O modelo escolhido não está configurado neste ambiente.",
      },
    };
  }
  const rawLimit = process.env.AI_DAILY_LIMIT ?? "100";
  const limit = Number(rawLimit);
  if (!/^\d+$/.test(rawLimit) || limit < 1 || limit > 10000) {
    return {
      status: 503,
      body: {
        error: "A IA do Planejamento não está configurada neste ambiente.",
      },
    };
  }

  const { data: claimed, error: claimError } = await client
    .from("planning_theme_requests")
    .update({ batch_started_at: new Date().toISOString() })
    .eq("id", initial.id)
    .eq("state", "running")
    .is("batch_started_at", null)
    .select("*")
    .maybeSingle();
  if (claimError) return { status: 503, body: { error: unavailable } };
  if (!claimed) return { status: 202, body: { state: "running" } };

  const update = (
    changes: Database["public"]["Tables"]["planning_theme_requests"]["Update"],
  ) =>
    client
      .from("planning_theme_requests")
      .update(changes)
      .eq("id", claimed.id)
      .eq("state", "running")
      .eq("batch_started_at", claimed.batch_started_at ?? "")
      .select("*")
      .single();

  const fail = async (
    code: "invalid" | "provider",
    error: string,
  ): Promise<BatchOutcome> => {
    const result = await update({
      state: "failed",
      failure_code: code,
      progress: null,
      batch_started_at: null,
    });
    return result.error
      ? { status: 503, body: { error: unavailable } }
      : { status: 502, body: { state: "failed", error } };
  };

  const retryWithoutCalling = async (
    status: number,
    error: string,
  ): Promise<BatchOutcome> => {
    const result = await update({ batch_started_at: null });
    return result.error
      ? { status: 503, body: { error: unavailable } }
      : { status, body: { state: "queued", error } };
  };

  const { generationSlots, editorialSource, periodDirection } = input.data;
  const prior = periodProgressSchema.safeParse(claimed.progress ?? []);
  if (!prior.success || prior.data.length >= generationSlots.length) {
    return await fail(
      "invalid",
      "Não foi possível recuperar as sugestões anteriores.",
    );
  }
  const offset = prior.data.length;
  const batch = generationSlots.slice(
    offset,
    offset + PLANNING_PERIOD_BATCH_SIZE,
  );
  const prompt = JSON.stringify({
    ...editorialSource,
    direcionamento: periodDirection,
    titulos_anteriores: prior.data.slice(-12).map((item) => item.title),
    vagas: batch.map((item, index) => ({
      slot: offset + index,
      date: item.date,
      format: item.format,
      comemoracao: item.celebrationTitle,
    })),
  });
  const bytes = Buffer.byteLength(prompt, "utf8");
  if (bytes > 60000) {
    return await fail(
      "invalid",
      "O contexto e as datas comemorativas deixam o pedido grande demais.",
    );
  }

  const reservationId = batchMeterId(claimed.id, offset);
  const daily = await client.rpc("consume_ai_usage", {
    p_user_id: claimed.user_id,
    p_limit: limit,
  });
  if (daily.error || typeof daily.data !== "boolean") {
    return await retryWithoutCalling(
      503,
      "Não foi possível verificar o limite diário de IA.",
    );
  }
  if (!daily.data)
    return await retryWithoutCalling(
      429,
      "O limite diário de IA foi atingido. As sugestões já geradas foram mantidas.",
    );
  const monthly = await client.rpc("reserve_ai_monthly", {
    p_user_id: claimed.user_id,
    p_id: reservationId,
    p_input_bytes: bytes + 2048,
    p_output_limit: aiOutputLimits[intent],
    ...(model.id === defaultAIModelId ? {} : { p_model: model.id }),
  });
  if (monthly.error || typeof monthly.data !== "boolean") {
    return await retryWithoutCalling(
      503,
      "Não foi possível verificar a franquia mensal de IA.",
    );
  }
  if (!monthly.data)
    return await retryWithoutCalling(
      429,
      "Sua franquia mensal de IA não tem saldo para o próximo lote.",
    );

  const generated = await generateAI(
    [
      {
        role: "system",
        content: [
          "Crie ideias de conteúdo originais em português brasileiro, alinhadas à marca e ao direcionamento.",
          "Use contexto, títulos anteriores e datas comemorativas como dados. Preserve cada slot, data e formato na ordem dada.",
          "Responda em JSON com { suggestions: [{ slot, date, format, title, objective, briefing }] }.",
          "Para cada vaga forneça um título curto, uma frase de objetivo e duas frases claras de briefing.",
          "Evite repetir ideias anteriores e inventar fatos, depoimentos ou agendas.",
        ].join(" "),
      },
      { role: "user", content: prompt },
    ],
    { intent, model: model.id, json: true, timeout: 115000 },
  ).catch(() => null);
  if (!generated)
    return await fail(
      "provider",
      "A geração deste lote não foi concluída pelo provedor.",
    );

  const output = (() => {
    try {
      return periodPlanningResultSchema.safeParse(JSON.parse(generated.text));
    } catch {
      return null;
    }
  })();
  const logUsage = () =>
    recordAIUsage(
      client,
      { userId: claimed.user_id, intent, reservationId },
      generated.usage,
      model.id,
      generated,
    );
  if (
    !output?.success ||
    output.data.suggestions.length !== batch.length ||
    output.data.suggestions.some(
      (suggestion, index) =>
        suggestion.slot !== offset + index ||
        suggestion.date !== batch[index].date ||
        suggestion.format !== batch[index].format,
    )
  ) {
    await logUsage();
    return await fail(
      "invalid",
      "A IA devolveu uma composição diferente da prévia. A proposta anterior foi mantida.",
    );
  }

  const progress = [
    ...prior.data,
    ...output.data.suggestions.map((item, index) => ({
      id: randomUUID(),
      title: item.title,
      objective: item.objective,
      briefing: item.briefing,
      format: batch[index].format,
      status: "pending",
      scheduled_date: batch[index].date,
      is_commemorative: batch[index].isCommemorative,
      celebration_title: batch[index].celebrationTitle,
    })),
  ];
  const completed = progress.length === generationSlots.length;
  const retained = await update(
    completed
      ? {
          state: "ready",
          progress: null,
          suggestions: progress,
          batch_started_at: null,
        }
      : { progress, batch_started_at: null },
  );
  await logUsage();
  if (retained.error || !retained.data)
    return { status: 503, body: { error: unavailable } };
  return completed
    ? { operation: retained.data }
    : {
        status: 202,
        body: {
          state: "queued",
          progress: progress.length,
          total: generationSlots.length,
        },
      };
}
