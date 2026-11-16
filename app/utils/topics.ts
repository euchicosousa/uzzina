import type { Partner, PartnerTopic } from "~/types";

export interface PartnerTopicGroup {
  partner: Pick<Partner, "id" | "slug" | "title">;
  topics: PartnerTopic[];
}

/**
 * Topics of every given partner slug, grouped by partner in the order of the
 * slugs. Partners without topics still appear (with an empty list) so the UI
 * can explain where topics are created.
 */
export function groupTopicsByPartner(
  topics: readonly PartnerTopic[],
  partners: readonly Pick<Partner, "id" | "slug" | "title">[],
  slugs: readonly string[],
): PartnerTopicGroup[] {
  const groups: PartnerTopicGroup[] = [];
  for (const slug of new Set(slugs)) {
    const partner = partners.find((item) => item.slug === slug);
    if (!partner) continue;
    groups.push({
      partner,
      topics: topics
        .filter((topic) => topic.partner_id === partner.id)
        .sort((a, b) => a.position - b.position),
    });
  }
  return groups;
}

/** A topic stays on the action after a partner change only while the partner that owns it is still in the action. */
export function shouldKeepTopicAfterPartnerChange(
  topicId: string | null | undefined,
  nextPartnerSlugs: readonly string[],
  topics: readonly PartnerTopic[],
  partners: readonly Pick<Partner, "id" | "slug">[],
): boolean {
  if (!topicId) return true;
  const topic = topics.find((item) => item.id === topicId);
  // Unknown topic (not loaded yet or not visible): leave the decision to the database trigger.
  if (!topic) return true;
  const owner = partners.find((partner) => partner.id === topic.partner_id);
  return Boolean(owner && nextPartnerSlugs.includes(owner.slug));
}

/**
 * The bulk topic menu only works when every selected action has exactly the
 * same set of partners (order irrelevant). Returns that sorted set, or null
 * when the selection is empty or mixed.
 */
export function getSharedPartnerSet(
  actions: readonly { partners: readonly string[] }[],
): string[] | null {
  if (actions.length === 0) return null;
  const normalize = (partners: readonly string[]) =>
    [...new Set(partners)].sort();
  const first = normalize(actions[0].partners);
  if (first.length === 0) return null;
  for (const action of actions) {
    const current = normalize(action.partners);
    if (
      current.length !== first.length ||
      current.some((slug, index) => slug !== first[index])
    )
      return null;
  }
  return first;
}
