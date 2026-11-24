import classDeck from "../data/classDeck.json";
import { UNITS } from "../data/curriculum";

const TYPE_MAP = { noun: "noun", verb: "verb", adjective: "adj", others: "other" };
const CODE_MAP = { n: "noun", v: "verb", a: "adj", o: "other" };

export const wordKey = (w) => `${w.art || ""}|${w.de}`.toLowerCase();

function fromClass(r, unit) {
  return {
    de: r.german,
    en: r.english,
    art: r.article || null,
    pl: r.plural || null,
    plOnly: !!r.pluralOnly,
    type: TYPE_MAP[r.type] || "other",
    vt: r.verbType || null,
    unit: unit.id,
    level: unit.level,
    src: "class",
    quiz: r.quiz,
  };
}

function parseLine(line, unit) {
  const p = line.split("|");
  const type = CODE_MAP[p[0]];
  if (type === "noun") {
    const [, art, de, pl, en] = p;
    return { de, en, art, pl: pl === "-" ? de : pl || null, plOnly: !pl && ["Eltern", "Geschwister", "Medien"].includes(de), type, unit: unit.id, level: unit.level, src: "core" };
  }
  if (type === "verb") return { de: p[1], en: p[2], vt: p[3] || null, type, unit: unit.id, level: unit.level, src: "core" };
  return { de: p[1], en: p[2], type, unit: unit.id, level: unit.level, src: "core" };
}

let cache = null;

/** All built-in words, keyed; class words keep their quiz number. */
export function buildWords(custom = []) {
  if (!cache) {
    const list = [];
    for (const unit of UNITS) {
      if (unit.quiz) {
        classDeck.filter((r) => r.quiz === unit.quiz && r.german).forEach((r) => list.push(fromClass(r, unit)));
      } else {
        unit.vocab.trim().split("\n").filter(Boolean).forEach((l) => list.push(parseLine(l.trim(), unit)));
      }
    }
    // de-duplicate within a unit (class deck has repeats across quizzes — keep both units, merge progress via key)
    const seen = new Set();
    cache = list.filter((w) => {
      const k = w.unit + wordKey(w);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    cache.forEach((w) => (w.key = wordKey(w)));
  }
  const customWords = custom.map((c) => ({ ...c, unit: "custom", level: "★", src: "custom", key: wordKey(c) }));
  return [...cache, ...customWords];
}

export const displayDe = (w) => (w.art ? `${w.art} ${w.de}` : w.de);

export const TYPE_LABEL = { noun: "Nomen", verb: "Verb", adj: "Adjektiv", other: "Wort" };
