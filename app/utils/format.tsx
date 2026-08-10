import type { Person, Partner, StrategyItem } from "~/types";
import { Link } from "@tanstack/react-router";

export function getFormattedPartnersName(partners: Partner[]) {
  return partners.map((partner) => partner.title).join(", ");
}

export function getFormattedPartnersLinks(partners: Partner[]) {
  return partners.map((partner, index) => (
    <span key={partner.id}>
      {index > 0 && ", "}
      <Link
        to="/app/partner/$slug"
        params={{ slug: partner.slug }}
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

export function parseStrategies(raw: unknown): StrategyItem[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
    const dict = parsed as Record<string, unknown>;
    if (Array.isArray(dict.strategies)) {
      parsed = dict.strategies;
    }
  }
  if (!Array.isArray(parsed)) return [];
  return (parsed as Record<string, unknown>[]).map((item) => ({
    headline: String(item.headline || item.titulo || item.Title || ""),
    angulo: String(item.angulo || item.angle || item.Angulo || ""),
    racional: String(item.racional || item.rational || item.Racional || ""),
    direcionamento: String(
      item.direcionamento || item.direction || item.Direcionamento || "",
    ),
  }));
}
