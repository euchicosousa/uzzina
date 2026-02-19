export function getFormattedPartnersName(partners: Partner[]) {
  return partners.map((partner) => partner.title).join(", ");
}

export function getFormattedPeopleName(people: Person[]) {
  return people
    .filter((p) => p)
    .map((person) => person.name)
    .join(", ");
}
