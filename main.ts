// One Star, Five Stars for the Food — make.fun entry.
// An alien tourist's one-star review of Earth that still slips in a
// compliment about the food. The program writes the single sentence to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt) for the judge.

import { promises as fsp } from "node:fs";
import { join, resolve } from "node:path";

// House gate: entry.txt must be UTF-8, 1-200 characters, not only whitespace.
const GATE = Object.freeze({
  minChars: 1,
  maxChars: 200,
  fileName: "entry.txt",
  defaultOutDir: "/output",
  outDirEnv: "MAKEFUN_OUTPUT_DIR",
});

// The entry: one sentence, 193 characters. Complaint first, food
// compliment second — the turn between them is the joke.
const REVIEW_PARTS = Object.freeze({
  complaint:
    "One star for the wobbly chairs, the waiter who forgot us, " +
    "and the playlist stuck on one song",
  compliment:
    "five stars for the dumplings, which made me forgive all of it " +
    "before the first bite was even gone",
});

function composeReview(parts: typeof REVIEW_PARTS): string {
  // Em dash joins the one-star gripe to the five-star food praise.
  return `${parts.complaint} — ${parts.compliment}.`;
}

function validate(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < GATE.minChars) {
    throw new Error("review is empty");
  }
  if (trimmed.length > GATE.maxChars) {
    throw new Error(
      `review is ${trimmed.length} chars, over the ${GATE.maxChars} cap`,
    );
  }
  if (!/\s/.test(trimmed)) {
    throw new Error("review must contain more than a single word");
  }
  if (/[\r\n]/.test(trimmed)) {
    throw new Error("review must stay on a single line");
  }
  return trimmed;
}

function resolveOutDir(): string {
  const fromEnv = process.env[GATE.outDirEnv];
  return resolve(fromEnv && fromEnv.length > 0 ? fromEnv : GATE.defaultOutDir);
}

async function handIn(): Promise<void> {
  const review = validate(composeReview(REVIEW_PARTS));
  const outDir = resolveOutDir();
  await fsp.mkdir(outDir, { recursive: true });
  const target = join(outDir, GATE.fileName);
  await fsp.writeFile(target, review + "\n", "utf8");
  const roundTrip = await fsp.readFile(target, "utf8");
  if (roundTrip.trim() !== review) {
    throw new Error("round-trip check failed: entry.txt mismatch");
  }
  console.log(`wrote ${target} (${review.length} chars)`);
  console.log(review);
}

handIn().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
