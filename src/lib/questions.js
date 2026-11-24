import { displayDe } from "./words";
import { canSpeak } from "./fx";
import { PERSONS, VERBS, present, perfekt, prateritum } from "../data/verbs";

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

function distractors(word, pool, field, n = 3) {
  const same = pool.filter((w) => w.type === word.type && w[field] !== word[field] && w.key !== word.key);
  const seen = new Set([word[field].toLowerCase()]);
  const out = [];
  for (const w of shuffle(same.length >= n ? same : pool)) {
    const v = field === "de" ? displayDe(w) : w[field];
    if (seen.has(w[field].toLowerCase())) continue;
    seen.add(w[field].toLowerCase());
    out.push(v);
    if (out.length === n) break;
  }
  return out;
}

function choice(correct, wrong) {
  const options = shuffle([correct, ...wrong]);
  return { options, answer: options.indexOf(correct) };
}

/** Make a question of a given kind for a word. */
export function wordQuestion(word, kind, pool, opts = {}) {
  const base = { word, key: word.key, speakText: displayDe(word) };
  switch (kind) {
    case "intro":
      return { ...base, kind: "intro" };
    case "mc_en":
      return { ...base, kind: "mc", label: "What does this mean?", prompt: displayDe(word), speakPrompt: true, ...choice(word.en, distractors(word, pool, "en")), xp: 8 };
    case "mc_de":
      return { ...base, kind: "mc", label: "Choose the German word", prompt: word.en, ...choice(displayDe(word), distractors(word, pool, "de")), deOptions: true, xp: 8 };
    case "article":
      return { ...base, kind: "article", label: "Which article?", prompt: word.de, sub: word.en, answer: word.art, xp: 8 };
    case "plural":
      return { ...base, kind: "type", label: "Type the plural", prompt: `${word.art} ${word.de}`, sub: word.en, answer: word.pl, prefix: "die", xp: 12 };
    case "listen":
      return { ...base, kind: "type", label: "Type what you hear", listen: true, prompt: "", answer: word.de, needArticle: word.type === "noun" && !word.plOnly ? word.art : null, xp: 12 };
    case "type":
    default:
      return {
        ...base,
        kind: "type",
        label: "Translate into German",
        prompt: word.en,
        sub: word.type === "verb" ? "verb · infinitive" : word.type === "noun" ? "noun · pick the article" : null,
        answer: word.de,
        needArticle: word.type === "noun" && !word.plOnly ? word.art : null,
        needPlural: opts.strict && word.type === "noun" && word.pl ? word.pl : null,
        xp: opts.strict ? 15 : 12,
      };
  }
}

function kindFor(word, box, opts = {}) {
  const isNoun = word.type === "noun" && word.art && !word.plOnly;
  const speak = canSpeak() && !opts.noListen;
  if (opts.strict) return "type";
  if (box <= 1) return pick(isNoun ? ["mc_en", "mc_de", "article"] : ["mc_en", "mc_de"]);
  if (box <= 3) return pick([...(isNoun ? ["article", "type"] : ["type"]), "mc_de", ...(speak ? ["listen"] : [])]);
  return pick([...(isNoun && word.pl && word.pl !== word.de ? ["plural"] : []), "type", "type", ...(speak ? ["listen"] : [])]);
}

/** New words from a unit: introduce, then quiz each one twice; mix in a few known ones. */
export function learnSession(unitWords, progress, pool, newCount = 6) {
  const unseen = unitWords.filter((w) => !progress[w.key]);
  const seen = unitWords.filter((w) => progress[w.key]);
  const fresh = shuffle(unseen).slice(0, newCount);
  const review = shuffle(seen).sort((a, b) => progress[a.key].b - progress[b.key].b).slice(0, fresh.length ? 4 : 12);
  const qs = [];
  // introduce in pairs, then quiz
  for (let i = 0; i < fresh.length; i += 2) {
    const group = fresh.slice(i, i + 2);
    group.forEach((w) => qs.push(wordQuestion(w, "intro", pool)));
    group.forEach((w) => qs.push(wordQuestion(w, "mc_en", pool)));
  }
  const second = shuffle(fresh).map((w) => wordQuestion(w, w.type === "noun" && w.art && !w.plOnly ? pick(["article", "mc_de"]) : "mc_de", pool));
  const third = shuffle(fresh).map((w) => wordQuestion(w, "type", pool));
  const rev = review.map((w) => wordQuestion(w, kindFor(w, progress[w.key].b), pool));
  return [...qs, ...interleave(second, rev.slice(0, 2)), ...interleave(third, rev.slice(2))];
}

function interleave(a, b) {
  const out = [];
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

/** Mixed practice from any list of words. */
export function practiceSession(words, progress, pool, { count = 12, strict = false } = {}) {
  return shuffle(words)
    .slice(0, count)
    .map((w) => wordQuestion(w, kindFor(w, progress[w.key]?.b ?? 0, { strict }), pool, { strict }));
}

export function grammarSession(lesson) {
  return shuffle(lesson.exercises).map((ex) => {
    if (ex.t === "c") {
      const correct = ex.o[ex.a];
      const options = shuffle(ex.o);
      return { kind: "mc", label: "Choose the right answer", prompt: ex.q, options, answer: options.indexOf(correct), explain: ex.x, gap: true, xp: 10 };
    }
    if (ex.t === "g") return { kind: "type", label: "Fill the gap", prompt: ex.q, answer: ex.a, explain: ex.x, gap: true, caseSensitive: true, xp: 12 };
    return { kind: "order", label: "Build the sentence", prompt: ex.q, answer: ex.a, alt: ex.alt || [], tiles: shuffle(ex.a.replace(/[,.?!]/g, "").split(" ")), explain: ex.x, xp: 12 };
  });
}

/** Verb gym: endless conjugation drill. */
export function conjQuestion(tenses = ["pres", "perf", "prat"]) {
  const verb = pick(VERBS);
  const options = tenses.filter((t) => t !== "prat" || verb.prat);
  const tense = pick(options.length ? options : ["pres"]);
  const p = (Math.random() * 6) | 0;
  let answer, label;
  if (tense === "pres") {
    answer = present(verb)[p];
    label = "Präsens";
  } else if (tense === "perf") {
    answer = perfekt(verb, p);
    label = "Perfekt";
  } else {
    answer = prateritum(verb, p);
    label = "Präteritum";
  }
  const pronoun = PERSONS[p].split("/")[0];
  return { kind: "type", label: `${label} · ${verb.en}`, prompt: `${pronoun} ___`, verb: verb.inf, sub: verb.inf, answer, caseSensitive: false, gap: true, speakText: `${pronoun} ${answer}`, xp: 0, tense };
}
