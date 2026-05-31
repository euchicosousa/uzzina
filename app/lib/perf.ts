/**
 * FLAGS DE PERFORMANCE
 *
 * Controle granular de otimizações para facilitar debug.
 * Altere para `false` para desativar e observar o comportamento original.
 */
export const PERF_FLAGS = {
  /**
   * Quando `true`: navegar entre abas (Home, Sprints, Calendário)
   * não refaz o fetch do loader do app.tsx — usa a memória do navegador.
   * Quando `false`: comportamento padrão do React Router (revalida sempre).
   */
  SMART_REVALIDATION: false,
} as const;
