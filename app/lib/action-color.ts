/**
 * Pure helpers shared by the app and the portal API (no dependencies, so the
 * serverless bundle can import them). The displayed color of an action is the
 * color of its topic; without a topic it is the action's own `color`.
 */
export interface TopicColorSource {
  id: string;
  color: string;
}

/** Maps topic IDs to their colors for constant-time lookups while rendering lists. */
export function buildTopicColorMap(
  topics: readonly TopicColorSource[],
): Map<string, string> {
  return new Map(topics.map((topic) => [topic.id, topic.color]));
}

/** Color of the action's topic, or null when it has no topic or the topic is unknown. */
export function getTopicColor(
  topicId: string | null | undefined,
  topicColors: ReadonlyMap<string, string>,
): string | null {
  if (!topicId) return null;
  return topicColors.get(topicId) ?? null;
}

/** Raw displayed color (topic color first); callers normalize it with `safeColor` when rendering. */
export function pickActionColor(
  action: { color?: string | null; topic_id?: string | null },
  topicColors: ReadonlyMap<string, string>,
): string | null {
  return getTopicColor(action.topic_id, topicColors) ?? action.color ?? null;
}
