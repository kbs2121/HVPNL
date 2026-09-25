import { findSubstationByCode, SUBSTATIONS, type Substation } from "@/lib/data/powerGridData";

/** slugify for soft matching (e.g. hisar-220kv) */
export function slugifySubstation(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Resolve a substation from GIS navigation query (`code` or `id` / slug).
 */
export function resolveSubstationQuery(raw: string): Substation | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const byCode = findSubstationByCode(trimmed);
  if (byCode) return byCode;

  const slug = slugifySubstation(trimmed);
  return SUBSTATIONS.find((s) => {
    const nameSlug = slugifySubstation(s.name);
    return (
      nameSlug === slug ||
      nameSlug.includes(slug) ||
      slug.includes(nameSlug) ||
      s.name.toLowerCase() === trimmed.toLowerCase()
    );
  });
}

/** Canonical Substation GIS URL for a network substation */
export function substationGisHref(ss: Pick<Substation, "code" | "name">): string {
  const params = new URLSearchParams({
    code: String(ss.code),
    id: slugifySubstation(ss.name),
  });
  return `/dashboard/substation-gis?${params.toString()}`;
}
