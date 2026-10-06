/** Keep cached or returned actions inside the current operational partner scope. */
export function filterOperationalActions<T extends {partners: string[] | null}>(
  actions: T[], partners: {slug:string;archived?:boolean | null}[],
): T[] {
  const slugs = new Set(partners.filter(partner=>!partner.archived).map(partner=>partner.slug));
  return actions.filter(action=>action.partners?.some(slug=>slugs.has(slug)));
}
