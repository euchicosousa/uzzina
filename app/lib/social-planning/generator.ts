import { saveSocialPlan } from "./storage";
import type {
  PlanFormat,
  PlanMode,
  PlanSuggestion,
  PlanSuggestionStatus,
  SocialPlan,
} from "./types";

export interface PlanningSlotInput {
  date: string;
  isCommemorative?: boolean;
  celebrationTitle?: string;
}

export interface GenerateSocialPlanParams {
  partner: {
    slug: string;
    title: string;
    context?: string;
    voice_tone?: string;
  };
  mode: PlanMode;
  input: Record<string, unknown>;
  slots?: PlanningSlotInput[];
  formats?: PlanFormat[];
}

function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface EditorialAngle {
  titleTemplate: (topic: string, partner: string) => string;
  defaultFormat: PlanFormat;
  objective: string;
  briefingTemplate: (
    topic: string,
    partner: string,
    context?: string,
    voiceTone?: string,
  ) => string;
}

const EDITORIAL_ANGLES: EditorialAngle[] = [
  {
    titleTemplate: (topic, partner) =>
      `3 Mitos sobre ${topic} que você precisa parar de acreditar`,
    defaultFormat: "reels",
    objective:
      "Atração e conscientização (topo de funil com quebra de objeções)",
    briefingTemplate: (topic, partner, context, voiceTone) =>
      `Gancho inicial dinâmico desmistificando 3 crenças comuns sobre ${topic}. Apresentar a visão técnica e diferenciada de ${partner}${
        voiceTone ? ` em tom ${voiceTone}` : ""
      }. ${context ? `Considerar o contexto do cliente: ${context}. ` : ""}Finalizar incentivando comentários com a opinião dos seguidores.`,
  },
  {
    titleTemplate: (topic) => `Passo a passo definitivo para dominar ${topic}`,
    defaultFormat: "carousel",
    objective:
      "Educação aprofundada e alto potencial de salvamentos (meio de funil)",
    briefingTemplate: (topic, partner, context, voiceTone) =>
      `Carrossel educativo em 5 slides. Slide 1 com headline forte de promessa; slides 2 a 4 estruturando um roteiro prático e aplicável de ${topic}; último slide recapitulando o valor do método de ${partner}. Estilo visual limpo${
        voiceTone ? `, comunicando com tom ${voiceTone}` : ""
      }.`,
  },
  {
    titleTemplate: (topic, partner) =>
      `Bastidores: como a equipe de ${partner} aplica ${topic} na prática`,
    defaultFormat: "reels",
    objective: "Humanização de marca e prova de processo (autoridade)",
    briefingTemplate: (topic, partner, _context, voiceTone) =>
      `Gravação dos bastidores com ritmo ágil. Mostrar detalhes operacionais, ferramentas ou atendimento focados em ${topic}. Transmitir transparência e cuidado profissional${
        voiceTone ? ` no tom ${voiceTone}` : ""
      }. Legenda convidando o público a conhecer o serviço.`,
  },
  {
    titleTemplate: (topic) =>
      `Os maiores erros cometidos em ${topic} (e como evitá-los)`,
    defaultFormat: "static",
    objective: "Geração de urgência e diagnóstico de problemas comuns",
    briefingTemplate: (topic, partner, context, voiceTone) =>
      `Arte estática impactante com tipografia em destaque. Apresentar os 3 erros mais frequentes de quem tenta lidar com ${topic} sem orientação. Na legenda, detalhar as consequências e destacar a abordagem consultiva de ${partner}.`,
  },
  {
    titleTemplate: (topic, partner) =>
      `Estudo de caso: Como transformar resultados com ${topic}`,
    defaultFormat: "carousel",
    objective: "Prova social e conversão qualificada (fundo de funil)",
    briefingTemplate: (topic, partner, context, voiceTone) =>
      `Carrossel narrativo: ponto de partida com o desafio real, estratégia adotada em ${topic} e métricas/resultados conquistados pela metodologia de ${partner}. Tom inspirador${
        voiceTone ? ` e ${voiceTone}` : ""
      }. Chamada clara para envio de mensagem privada.`,
  },
  {
    titleTemplate: (topic) =>
      `Checklist rápido: Você está pronto para implementar ${topic}?`,
    defaultFormat: "carousel",
    objective: "Autoavaliação e retenção de público qualificado",
    briefingTemplate: (topic, partner) =>
      `Checklist visual em formato de lista com caixas de marcação. Pontos críticos para avaliar a maturidade em ${topic}. No slide final, convite para agendar uma conversa diagnóstica com ${partner}.`,
  },
  {
    titleTemplate: (topic) =>
      `Respondendo as dúvidas mais enviadas sobre ${topic}`,
    defaultFormat: "reels",
    objective: "Relacionamento e esclarecimento direto de barreiras de compra",
    briefingTemplate: (topic, partner, _context, voiceTone) =>
      `Vídeo focado respondendo 3 perguntas reais recebidas na caixa de perguntas. Respostas sucintas e práticas, demonstrando domínio do tema${
        voiceTone ? ` com tom ${voiceTone}` : ""
      }. Na legenda, abrir espaço para novas dúvidas.`,
  },
  {
    titleTemplate: (topic) => `O que muda em ${topic} e como se preparar agora`,
    defaultFormat: "static",
    objective: "Posicionamento como vanguarda e autoridade no setor",
    briefingTemplate: (topic, partner, context) =>
      `Visual sóbrio destacando uma tendência ou dado recente do mercado sobre ${topic}. Na legenda, análise aprofundada de ${partner} sobre os impactos práticos e direcionamento para os clientes.`,
  },
  {
    titleTemplate: (topic, partner) =>
      `Por que ${partner} escolheu fazer diferente quando o assunto é ${topic}`,
    defaultFormat: "carousel",
    objective: "Diferenciação competitiva e reforço de proposta de valor",
    briefingTemplate: (topic, partner, context, voiceTone) =>
      `Narrativa institucional explicando a filosofia de trabalho de ${partner} em relação a ${topic}. Demonstrar os diferenciais que tornam a entrega única frente à concorrência.`,
  },
];

function buildCommemorativeSuggestion(
  partner: { title: string; voice_tone?: string; context?: string },
  celebrationTitle: string,
  scheduledDate?: string,
  format: PlanFormat = "carousel",
): PlanSuggestion {
  return {
    id: generateUUID(),
    title: `Especial ${celebrationTitle}: O olhar de ${partner.title}`,
    format,
    objective: `Celebração da data sazonal (${celebrationTitle}) com foco em conexão emocional e engajamento da comunidade`,
    briefing: `Criar uma peça especial conectando o significado de ${celebrationTitle} à atuação e aos valores de ${partner.title}. Evitar mensagens genéricas ou clichês: humanizar a comunicação${
      partner.voice_tone ? ` com tom ${partner.voice_tone}` : ""
    }${
      partner.context ? `, alinhando ao contexto: ${partner.context}` : ""
    }. Fazer uma chamada afetiva convidando o público a compartilhar histórias ou marcar pessoas queridas nos comentários.`,
    scheduled_date: scheduledDate,
    status: "pending" as PlanSuggestionStatus,
    is_commemorative: true,
    celebration_title: celebrationTitle,
  };
}

function resolveTopic(
  input: Record<string, unknown>,
  partner: { title: string; context?: string },
): string {
  const explicitDirection =
    typeof input.direction === "string" && input.direction.trim()
      ? input.direction.trim()
      : typeof input.themeDirection === "string" && input.themeDirection.trim()
        ? input.themeDirection.trim()
        : typeof input.periodDirection === "string" &&
            input.periodDirection.trim()
          ? input.periodDirection.trim()
          : typeof input.theme === "string" && input.theme.trim()
            ? input.theme.trim()
            : null;

  if (explicitDirection) {
    // If it's a short topic, return directly. If it's a longer direction, summarize or take leading phrase.
    if (explicitDirection.length <= 60) {
      return explicitDirection;
    }
    const firstSentence = explicitDirection.split(/[.\n]/)[0]?.trim();
    if (
      firstSentence &&
      firstSentence.length > 5 &&
      firstSentence.length <= 70
    ) {
      return firstSentence;
    }
    return explicitDirection.slice(0, 50).trim() + "...";
  }

  if (partner.context && partner.context.trim()) {
    const firstCtx = partner.context.split(/[.\n]/)[0]?.trim();
    if (firstCtx && firstCtx.length > 5 && firstCtx.length <= 60) {
      return firstCtx;
    }
  }

  return `estratégia e serviços de ${partner.title}`;
}

function buildFormatDistributionPool(
  input: Record<string, unknown>,
  count: number,
  formatsOverride?: PlanFormat[],
): PlanFormat[] {
  if (formatsOverride && formatsOverride.length > 0) {
    const pool: PlanFormat[] = [];
    for (let i = 0; i < count; i++) {
      const fmt = formatsOverride[i % formatsOverride.length];
      if (fmt) pool.push(fmt);
    }
    return pool;
  }

  const formatMode =
    typeof input.formatMode === "string" ? input.formatMode : "auto";

  if (formatMode === "manual") {
    const reelsCount =
      typeof input.reelsCount === "number"
        ? input.reelsCount
        : typeof (
              input.formatsDistribution as Record<string, unknown> | undefined
            )?.reels === "number"
          ? ((input.formatsDistribution as Record<string, unknown>)
              .reels as number)
          : 0;
    const staticCount =
      typeof input.staticCount === "number"
        ? input.staticCount
        : typeof (
              input.formatsDistribution as Record<string, unknown> | undefined
            )?.static === "number"
          ? ((input.formatsDistribution as Record<string, unknown>)
              .static as number)
          : 0;
    const carouselCount =
      typeof input.carouselCount === "number"
        ? input.carouselCount
        : typeof (
              input.formatsDistribution as Record<string, unknown> | undefined
            )?.carousel === "number"
          ? ((input.formatsDistribution as Record<string, unknown>)
              .carousel as number)
          : 0;

    const manualPool: PlanFormat[] = [];
    for (let i = 0; i < reelsCount; i++) manualPool.push("reels");
    for (let i = 0; i < carouselCount; i++) manualPool.push("carousel");
    for (let i = 0; i < staticCount; i++) manualPool.push("static");

    if (manualPool.length > 0) {
      const finalPool: PlanFormat[] = [];
      for (let i = 0; i < count; i++) {
        const item = manualPool[i % manualPool.length];
        if (item) finalPool.push(item);
      }
      return finalPool;
    }
  }

  // Automatic balanced rotation: reels -> carousel -> static -> carousel -> reels
  const defaultRotation: PlanFormat[] = [
    "carousel",
    "reels",
    "static",
    "carousel",
    "reels",
  ];
  const autoPool: PlanFormat[] = [];
  for (let i = 0; i < count; i++) {
    const fmt = defaultRotation[i % defaultRotation.length];
    if (fmt) autoPool.push(fmt);
  }
  return autoPool;
}

/**
 * Generates a full, rich and contextual SocialPlan proposal for a partner.
 * Handles both 'theme' mode (variable quantity of suggestions) and 'period' mode (dated slots and commemorations).
 * Persists the resulting plan to storage and returns it.
 */
export function generateSocialPlan({
  partner,
  mode,
  input,
  slots,
  formats,
}: GenerateSocialPlanParams): SocialPlan {
  const topic = resolveTopic(input, partner);

  let targetCount = 6;
  if (mode === "theme") {
    if (typeof input.themeCount === "number" && input.themeCount > 0) {
      targetCount = input.themeCount;
    } else if (typeof input.count === "number" && input.count > 0) {
      targetCount = input.count;
    }
  } else if (mode === "period") {
    if (slots && slots.length > 0) {
      targetCount = slots.length;
    } else if (typeof input.postsPerWeek === "number") {
      targetCount = Math.max(3, input.postsPerWeek * 2);
    }
  }

  const formatPool = buildFormatDistributionPool(input, targetCount, formats);
  const suggestions: PlanSuggestion[] = [];

  if (mode === "period" && slots && slots.length > 0) {
    // Generate one suggestion per slot
    slots.forEach((slot, index) => {
      const assignedFormat = formatPool[index] || "carousel";

      if (slot.isCommemorative && slot.celebrationTitle) {
        suggestions.push(
          buildCommemorativeSuggestion(
            partner,
            slot.celebrationTitle,
            slot.date,
            assignedFormat,
          ),
        );
      } else {
        const angle = EDITORIAL_ANGLES[index % EDITORIAL_ANGLES.length];
        const effectiveAngle = angle || EDITORIAL_ANGLES[0];
        if (!effectiveAngle) return;

        suggestions.push({
          id: generateUUID(),
          title: effectiveAngle.titleTemplate(topic, partner.title),
          format: assignedFormat,
          objective: effectiveAngle.objective,
          briefing: effectiveAngle.briefingTemplate(
            topic,
            partner.title,
            partner.context,
            partner.voice_tone,
          ),
          scheduled_date: slot.date,
          status: "pending",
        });
      }
    });
  } else {
    // Theme mode or period mode without explicit slots
    for (let i = 0; i < targetCount; i++) {
      const assignedFormat = formatPool[i] || "carousel";
      const angle = EDITORIAL_ANGLES[i % EDITORIAL_ANGLES.length];
      const effectiveAngle = angle || EDITORIAL_ANGLES[0];
      if (!effectiveAngle) continue;

      suggestions.push({
        id: generateUUID(),
        title: effectiveAngle.titleTemplate(topic, partner.title),
        format: assignedFormat,
        objective: effectiveAngle.objective,
        briefing: effectiveAngle.briefingTemplate(
          topic,
          partner.title,
          partner.context,
          partner.voice_tone,
        ),
        status: "pending",
      });
    }
  }

  const now = new Date().toISOString();
  const plan: SocialPlan = {
    id: generateUUID(),
    partner_slug: partner.slug,
    partner_title: partner.title,
    mode,
    input,
    suggestions,
    status: "draft",
    created_at: now,
    updated_at: now,
  };

  saveSocialPlan(plan);
  return plan;
}
