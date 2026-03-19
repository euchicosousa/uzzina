export const getPeople = (users_ids: string[], people: Person[]) => {
  return users_ids
    .map((user_id) => people.find((p) => p.user_id === user_id))
    .filter((r) => r !== undefined);
};
