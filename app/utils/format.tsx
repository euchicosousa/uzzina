import { Link } from "react-router";
import type { Partner } from "~/models/partners.server";
import type { Person } from "~/models/people.server";

export function getFormattedPartnersName(partners: Partner[]) {
  return partners.map((partner) => partner.title).join(", ");
}

export function getFormattedPartnersLinks(partners: Partner[]) {
  return partners.map((partner, index) => (
    <span key={partner.id}>
      {index > 0 && ", "}
      <Link
        to={`/app/partner/${partner.slug}`}
        className="hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {partner.title}
      </Link>
    </span>
  ));
}

export function getFormattedPeopleName(people: Person[]) {
  return people
    .filter((p) => p)
    .map((person) => person.name)
    .join(", ");
}
