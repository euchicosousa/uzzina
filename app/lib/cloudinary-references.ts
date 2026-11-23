const CLOUDINARY_URL_PATTERN =
  /https?:\/\/res\.cloudinary\.com\/[^\s"'<>`()[\]]+/gi;

const TRAILING_PUNCTUATION = /[.,;:!?)>"'\]]+$/;

const SINGLE_TRANSFORM_PREFIX =
  /^(?:w|h|c|q|f|g|e|b|l|u|a|r|x|y|z|o|d|t|ar|fl|dpr|bo|co|dn|du|eo|so|sp|vc|ac|br|pg|cs|if)_/i;

function isTransformSegment(segment: string): boolean {
  if (!segment) return false;
  if (/^s--[A-Za-z0-9_-]+--$/.test(segment)) return true;
  if (segment.includes(",")) {
    return segment
      .split(",")
      .every((part) => SINGLE_TRANSFORM_PREFIX.test(part.trim()));
  }
  return SINGLE_TRANSFORM_PREFIX.test(segment);
}

function collectStrings(
  value: unknown,
  results: string[],
  depth: number,
  seen: Set<unknown>,
): void {
  if (value == null || depth > 5) return;
  if (typeof value === "string") {
    const matches = value.match(CLOUDINARY_URL_PATTERN);
    if (!matches) return;
    for (const raw of matches) {
      const cleaned = raw.replace(TRAILING_PUNCTUATION, "");
      if (cleaned) results.push(cleaned);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, results, depth + 1, seen);
    }
    return;
  }

  for (const nested of Object.values(value)) {
    collectStrings(nested, results, depth + 1, seen);
  }
}

/**
 * Extracts all unique Cloudinary delivery URLs from a string, array, or plain object.
 */
export function extractCloudinaryUrls(value: unknown): string[] {
  const raw: string[] = [];
  collectStrings(value, raw, 0, new Set());
  return Array.from(new Set(raw));
}

/**
 * Normalizes a Cloudinary delivery URL into a stable key `<cloud>/<resourceType>/<publicId>`
 * so transformed, resized, or re-versioned URLs of the same asset match one another.
 */
export function normalizeCloudinaryAssetKey(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (parsed.hostname.toLowerCase() !== "res.cloudinary.com") {
    return null;
  }

  const segments = parsed.pathname
    .split("/")
    .filter((segment) => segment.length > 0);
  if (segments.length < 4) {
    return segments.length > 0 ? `path:${segments.join("/")}` : null;
  }

  const cloudName = segments[0].toLowerCase();
  const resourceType = segments[1].toLowerCase();
  const deliveryType = segments[2].toLowerCase();
  const rest = segments.slice(3);

  if (deliveryType === "fetch") {
    return `${cloudName}/${resourceType}/fetch/${rest.join("/")}`;
  }

  const versionIndex = rest.findIndex((segment) => /^v\d+$/.test(segment));
  let publicSegments: string[];

  if (versionIndex >= 0) {
    publicSegments = rest.slice(versionIndex + 1);
  } else {
    let startIndex = 0;
    while (
      startIndex < rest.length - 1 &&
      isTransformSegment(rest[startIndex])
    ) {
      startIndex += 1;
    }
    publicSegments = rest.slice(startIndex);
  }

  if (publicSegments.length === 0) {
    return `${cloudName}/${resourceType}/${rest.join("/")}`;
  }

  const joined = publicSegments
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");

  const normalizedPath =
    resourceType === "raw" ? joined : joined.replace(/\.[a-z0-9]{1,8}$/i, "");

  return `${cloudName}/${resourceType}/${normalizedPath}`;
}

export interface PartnerMediaClassification {
  totalCount: number;
  orphanCandidatesCount: number;
  sharedElsewhereCount: number;
  sampleOrphanUrls: string[];
}

/**
 * Compares Cloudinary URLs referenced by a partner (and its exclusive records)
 * against URLs still referenced anywhere else in the UZZINA database.
 */
export function classifyPartnerMedia(
  partnerSources: readonly unknown[],
  otherSources: readonly unknown[],
): PartnerMediaClassification {
  const partnerAssets = new Map<string, string>();
  for (const source of partnerSources) {
    for (const url of extractCloudinaryUrls(source)) {
      const key = normalizeCloudinaryAssetKey(url);
      if (key && !partnerAssets.has(key)) {
        partnerAssets.set(key, url);
      }
    }
  }

  const otherKeys = new Set<string>();
  for (const source of otherSources) {
    for (const url of extractCloudinaryUrls(source)) {
      const key = normalizeCloudinaryAssetKey(url);
      if (key) {
        otherKeys.add(key);
      }
    }
  }

  let sharedElsewhereCount = 0;
  const sampleOrphanUrls: string[] = [];
  let orphanCandidatesCount = 0;

  for (const [key, sampleUrl] of partnerAssets.entries()) {
    if (otherKeys.has(key)) {
      sharedElsewhereCount += 1;
    } else {
      orphanCandidatesCount += 1;
      if (sampleOrphanUrls.length < 10) {
        sampleOrphanUrls.push(sampleUrl);
      }
    }
  }

  return {
    totalCount: partnerAssets.size,
    orphanCandidatesCount,
    sharedElsewhereCount,
    sampleOrphanUrls,
  };
}
