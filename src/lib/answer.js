// Forgiving-but-honest answer checking.
// Returns { ok, note } — ok=true with a note means "accepted, but here's a nitpick".

const clean = (s) =>
  (s || "")
    .replace(/[.,!?;:¿¡"„“”']/g, "")
    .replace(/\s+/g, " ")
    .trim();

const deUmlaut = (s) => s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");

export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

/** Split "a / b, c" style answers into alternatives. Parenthesised parts are optional. */
export function alternatives(answer) {
  const out = new Set();
  String(answer)
    .split(/\s*[/|]\s*|\s*,\s*|\s*;\s*/)
    .filter(Boolean)
    .forEach((a) => {
      out.add(clean(a));
      if (/\(.*\)/.test(a)) {
        out.add(clean(a.replace(/\(.*?\)/g, "")));
        out.add(clean(a.replace(/[()]/g, "")));
      }
    });
  out.delete("");
  return [...out];
}

/**
 * Compare a typed answer against one or more accepted answers.
 * opts.caseSensitive: German nouns must be capitalised (lenient: accepted with note).
 * opts.typos: allow 1 typo on words of 5+ chars.
 */
export function check(input, accepted, opts = {}) {
  const { typos = true } = opts;
  const given = clean(input);
  if (!given) return { ok: false };
  const list = (Array.isArray(accepted) ? accepted : [accepted]).flatMap(alternatives);

  for (const a of list) if (given === a) return { ok: true };
  for (const a of list) if (given.toLowerCase() === a.toLowerCase()) return { ok: true, note: opts.caseNote || `Watch the capitals: **${a}**`, matched: a };
  for (const a of list) if (deUmlaut(given).toLowerCase() === deUmlaut(a).toLowerCase()) return { ok: true, note: `Use the special letters: **${a}**`, matched: a };
  if (typos) {
    for (const a of list) {
      if (a.length >= 5 && levenshtein(given.toLowerCase(), a.toLowerCase()) === 1) return { ok: true, typo: true, note: `Small typo — it's **${a}**`, matched: a };
    }
  }
  return { ok: false, expected: list[0] };
}

/** Normalise a sentence for word-order comparison. */
export const sentenceKey = (s) => clean(s).toLowerCase();
