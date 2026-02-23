/**
 * parseKietEmail — KIET institutional email parser & validator
 * ------------------------------------------------------------
 * Expected format:  firstname.2327csit1113@kiet.edu
 *
 * After the dot:
 *   - First 4 digits  → library_prefix  (e.g. "2327")
 *   - Next letters    → branch           (e.g. "csit")
 *   - Last 4 digits   → library_suffix  (e.g. "1113")
 *
 * Derived fields:
 *   library_id        = uppercase(library_prefix + branch + library_suffix)
 *   batch_start_year  = 2000 + parseInt(library_prefix.slice(0, 2))
 *   batch_end_year    = 2000 + parseInt(library_prefix.slice(2, 4))
 */

export const KIET_EMAIL_REGEX =
  /^[a-zA-Z]+\.([0-9]{4})([a-zA-Z]+)([0-9]{4})@kiet\.edu$/i;

/**
 * Whitelisted branch codes (lowercase).
 * Keep in sync with the branch field enum in the User model.
 */
export const ALLOWED_BRANCHES: ReadonlySet<string> = new Set([
  "csit",
  "cse",
  "it",
  "ece",
  "eee",
  "mech",
  "me",
  "civil",
  "ce",
  "mba",
  "mca",
  "en", // Electronics & Networking
  "cs",
]);

export interface ParsedKietEmail {
  /** e.g. "2327" — raw 4-digit prefix from email */
  library_prefix: string;
  /** e.g. "csit" — lowercase branch extracted from email */
  branch: string;
  /** e.g. "1113" — raw 4-digit suffix from email */
  library_suffix: string;
  /** e.g. "2327CSIT1113" — full uppercase library ID */
  library_id: string;
  /** e.g. 2023 */
  batch_start_year: number;
  /** e.g. 2027 */
  batch_end_year: number;
}

/**
 * Parses and validates a KIET institutional email address.
 *
 * @param email - Raw email string (case-insensitive)
 * @returns Structured object with all derived fields
 * @throws Error with a descriptive message if validation fails
 *
 * @example
 * parseKietEmail('ananya.2327csit1113@kiet.edu')
 * // → {
 * //     library_prefix: '2327', branch: 'csit', library_suffix: '1113',
 * //     library_id: '2327CSIT1113',
 * //     batch_start_year: 2023, batch_end_year: 2027
 * //   }
 */
export function parseKietEmail(email: string): ParsedKietEmail {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required.");
  }

  const lower = email.toLowerCase().trim();

  // ── 1. Domain check ────────────────────────────────────────────────────────
  if (!lower.endsWith("@kiet.edu")) {
    throw new Error("Email must belong to the @kiet.edu domain.");
  }

  // ── 2. Pattern check ───────────────────────────────────────────────────────
  const match = lower.match(KIET_EMAIL_REGEX);
  if (!match) {
    throw new Error(
      "Invalid KIET email format. " +
        "Expected pattern: firstname.YYYYbranchNNNN@kiet.edu " +
        "(e.g. ananya.2327csit1113@kiet.edu)",
    );
  }

  const [, library_prefix, branchRaw, library_suffix] = match;
  const branch = branchRaw.toLowerCase();

  // ── 3. Branch whitelist check ──────────────────────────────────────────────
  if (!ALLOWED_BRANCHES.has(branch)) {
    throw new Error(
      `Unknown branch code "${branch}". ` +
        `Allowed codes: ${[...ALLOWED_BRANCHES].sort().join(", ")}.`,
    );
  }

  // ── 4. Batch validity check (reject 0000) ──────────────────────────────────
  const startYY = parseInt(library_prefix.slice(0, 2), 10);
  const endYY = parseInt(library_prefix.slice(2, 4), 10);

  if (library_prefix === "0000" || startYY === 0 || endYY === 0) {
    throw new Error(
      `Invalid batch in library prefix "${library_prefix}". ` +
        "Neither the start year nor end year digits can be 00.",
    );
  }

  const batch_start_year = 2000 + startYY;
  const batch_end_year = 2000 + endYY;

  // ── 5. Compose library_id ──────────────────────────────────────────────────
  const library_id = (library_prefix + branch + library_suffix).toUpperCase();

  return {
    library_prefix,
    branch,
    library_suffix,
    library_id,
    batch_start_year,
    batch_end_year,
  };
}
