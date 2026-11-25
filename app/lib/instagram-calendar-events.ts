export type CalendarBatch = {
  action_id: string;
  partner_id: string;
  profile_username: string;
  format: string;
};
type Result = { id: string; permalink: string | null };
export type CalendarAttemptRow = {
  id: string;
  action_id: string;
  partner_id: string;
  profile_username: string;
  format: string;
  status: string;
  created_at: string;
  results: Result[];
};
export type CalendarScheduleRow = {
  id: string;
  attempt_id: string | null;
  scheduled_at: string;
  status: string;
  results: Result[];
  // O PostgREST devolve objeto para relação muitos-para-um; aceita array por segurança.
  instagram_schedule_batches: CalendarBatch | CalendarBatch[] | null;
};

export function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

const permalinksOf = (results: Result[] | null) =>
  (results ?? []).flatMap((result) =>
    result.permalink ? [result.permalink] : [],
  );

export function buildInstagramCalendarEvents({
  attempts,
  schedules,
  actions,
  partners,
}: {
  attempts: CalendarAttemptRow[];
  schedules: CalendarScheduleRow[];
  actions: Map<string, { title: string }>;
  partners: Map<string, { title: string }>;
}) {
  const scheduledAttemptIds = new Set(
    schedules.flatMap((row) => (row.attempt_id ? [row.attempt_id] : [])),
  );
  return [
    ...attempts
      .filter(
        (attempt) =>
          actions.has(attempt.action_id) &&
          !scheduledAttemptIds.has(attempt.id),
      )
      .map((attempt) => ({
        id: `publish:${attempt.id}`,
        actionId: attempt.action_id,
        actionTitle: actions.get(attempt.action_id)?.title ?? "Ação",
        partnerId: attempt.partner_id,
        partnerName:
          partners.get(attempt.partner_id)?.title ?? attempt.profile_username,
        profileUsername: attempt.profile_username,
        format: attempt.format,
        status: attempt.status,
        occurredAt: attempt.created_at,
        permalinks: permalinksOf(attempt.results),
      })),
    ...schedules.flatMap((schedule) => {
      const batch = firstRelation(schedule.instagram_schedule_batches);
      if (!batch) return [];
      const action = actions.get(batch.action_id);
      if (!action) return [];
      return [
        {
          id: `schedule:${schedule.id}`,
          actionId: batch.action_id,
          actionTitle: action.title,
          partnerId: batch.partner_id,
          partnerName:
            partners.get(batch.partner_id)?.title ?? batch.profile_username,
          profileUsername: batch.profile_username,
          format: batch.format,
          status: schedule.status,
          occurredAt: schedule.scheduled_at,
          permalinks: permalinksOf(schedule.results),
        },
      ];
    }),
  ].sort(
    (left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
  );
}
