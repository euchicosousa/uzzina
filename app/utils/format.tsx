import type { Person, Partner } from "~/types";
import { Link } from "react-router";

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
  const names: string[] = [];
  for (const p of people) {
    if (p) names.push(p.name);
  }
  return names.join(", ");
}
