import { useSyncExternalStore } from "react";

const KEY = "deutsch-flashcard:v2";
const DAY = 86400000;

export const today = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY);

const initial = () => ({
  version: 2,
  createdAt: Date.now(),
  xp: 0,
  goal: 50,
  streak: { count: 0, best: 0, last: null, freezes: 1 },
  days: {}, // date → { xp, correct, answered, newWords, reviews, grammar, games, perfect, maxCombo, quests: [] }
  words: {}, // key → { b: box 0-6, due, c, w, first, last }
  grammar: {}, // id → { best, done, attempts }
  games: { blitz: 0, match: 0, gym: 0 },
  achievements: {},
  custom: [],
  stats: { sessions: 0, perfect: 0, maxCombo: 0, answered: 0, correct: 0 },
  settings: { sound: true, autoSpeak: true, theme: "system", rate: 0.9, strictPlural: false },
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable */
  }
  return initial();
}

let state = load();
const listeners = new Set();
const events = []; // UI events: level-ups, achievements, quests
const eventListeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getState() {
  return state;
}

export function setState(fn) {
  const draft = structuredClone(state);
  fn(draft);
  const before = state;
  state = draft;
  postProcess(before, state);
  persist();
  listeners.forEach((l) => l());
}

export function useStore(selector = (s) => s) {
  return selector(useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), () => state));
}

export function onEvent(fn) {
  eventListeners.add(fn);
  while (events.length) fn(events.shift());
  return () => eventListeners.delete(fn);
}
function emit(e) {
  if (eventListeners.size) eventListeners.forEach((l) => l(e));
  else events.push(e);
}

// ── Levels ──────────────────────────────────────────────────────────────
export const LEVEL_TITLES = ["Neuling", "Anfänger", "Lehrling", "Entdecker", "Plauderer", "Sprecher", "Kenner", "Profi", "Meister", "Dichter", "Goethe-Fan", "Sprachgenie"];
export const xpForLevel = (l) => 50 * l * (l - 1); // L1:0, L2:100, L3:300, L4:600…
export function levelInfo(xp) {
  let l = 1;
  while (xp >= xpForLevel(l + 1)) l++;
  const base = xpForLevel(l), next = xpForLevel(l + 1);
  return { level: l, title: LEVEL_TITLES[Math.min(l - 1, LEVEL_TITLES.length - 1)], into: xp - base, span: next - base, pct: (xp - base) / (next - base) };
}

// ── Day bookkeeping & streak ────────────────────────────────────────────
export function dayOf(s, d = today()) {
  if (!s.days[d]) s.days[d] = { xp: 0, correct: 0, answered: 0, newWords: 0, reviews: 0, grammar: 0, games: 0, perfect: 0, maxCombo: 0, quests: [] };
  return s.days[d];
}

function touchStreak(s) {
  const t = today();
  const st = s.streak;
  if (st.last === t) return;
  const gap = st.last ? daysBetween(st.last, t) : null;
  if (gap === 1) st.count += 1;
  else if (gap === 2 && st.freezes > 0) {
    st.freezes -= 1;
    st.count += 1;
    emit({ type: "toast", icon: "🧊", text: "Streak freeze used — your streak survived!" });
  } else st.count = 1;
  st.last = t;
  if (st.count > st.best) st.best = st.count;
  if (st.count > 0 && st.count % 7 === 0 && st.freezes < 3) {
    st.freezes += 1;
    emit({ type: "toast", icon: "🧊", text: `${st.count}-day streak! You earned a streak freeze.` });
  }
}

/** Streak as currently displayed (0 if broken). */
export function liveStreak(s) {
  if (!s.streak.last) return 0;
  const gap = daysBetween(s.streak.last, today());
  if (gap <= 1) return s.streak.count;
  if (gap === 2 && s.streak.freezes > 0) return s.streak.count;
  return 0;
}

export function addXP(s, n) {
  if (n <= 0) return;
  touchStreak(s);
  s.xp += n;
  dayOf(s).xp += n;
}

// ── Spaced repetition (Leitner boxes) ───────────────────────────────────
const INTERVALS = [0, 1, 2, 4, 8, 16, 35]; // days per box
export const MASTERED_BOX = 4;

export function recordWord(s, key, correct, { soft = false } = {}) {
  const now = Date.now();
  let w = s.words[key];
  const isNew = !w;
  if (!w) w = s.words[key] = { b: 0, due: now, c: 0, w: 0, first: now, last: now };
  if (correct) {
    w.c++;
    if (!soft || w.b === 0) w.b = Math.min(6, w.b + 1);
  } else {
    w.w++;
    w.b = Math.max(0, Math.min(1, w.b - 2));
  }
  w.last = now;
  w.due = now + INTERVALS[w.b] * DAY - (w.b ? 3600000 : 0);
  if (isNew) dayOf(s).newWords++;
  return isNew;
}

export const isDue = (w, now = Date.now()) => w && w.due <= now;

// ── Daily quests ────────────────────────────────────────────────────────
const QUEST_POOL = [
  { id: "xp", icon: "⚡", text: (g) => `Earn ${g} XP`, goal: (s) => s.goal, val: (d) => d.xp },
  { id: "correct", icon: "✅", text: () => "Get 25 answers right", goal: () => 25, val: (d) => d.correct },
  { id: "combo", icon: "🔥", text: () => "Hit a 10× combo", goal: () => 10, val: (d) => d.maxCombo },
  { id: "new", icon: "🌱", text: () => "Learn 6 new words", goal: () => 6, val: (d) => d.newWords },
  { id: "review", icon: "🔁", text: () => "Review 15 words", goal: () => 15, val: (d) => d.reviews },
  { id: "grammar", icon: "📐", text: () => "Finish a grammar exercise", goal: () => 1, val: (d) => d.grammar },
  { id: "games", icon: "🎮", text: () => "Play 2 arcade games", goal: () => 2, val: (d) => d.games },
  { id: "perfect", icon: "💎", text: () => "Finish a session with no mistakes", goal: () => 1, val: (d) => d.perfect },
];

export function questsFor(s, date = today()) {
  // deterministic pick from the date: always include XP goal + 2 others
  let h = 0;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rest = QUEST_POOL.slice(1);
  const a = rest[h % rest.length];
  const b = rest[(h >>> 3) % rest.length] === a ? rest[(h % rest.length + 3) % rest.length] : rest[(h >>> 3) % rest.length];
  const d = s.days[date] || { xp: 0 };
  return [QUEST_POOL[0], a, b].map((q) => {
    const goal = q.goal(s);
    const v = q.val(d) || 0;
    return { id: q.id, icon: q.icon, text: q.text(goal), goal, value: Math.min(v, goal), done: v >= goal, claimed: (d.quests || []).includes(q.id) };
  });
}

// ── Achievements ────────────────────────────────────────────────────────
const learnedCount = (s) => Object.values(s.words).filter((w) => w.c > 0).length;
const masteredCount = (s) => Object.values(s.words).filter((w) => w.b >= MASTERED_BOX).length;
const grammarDone = (s) => Object.values(s.grammar).filter((g) => g.done).length;

export const ACHIEVEMENTS = [
  { id: "first", icon: "🐣", name: "Erster Schritt", desc: "Finish your first session", test: (s) => s.stats.sessions >= 1 },
  { id: "w25", icon: "📗", name: "Wortsammler", desc: "Learn 25 words", test: (s) => learnedCount(s) >= 25 },
  { id: "w100", icon: "📚", name: "Bücherwurm", desc: "Learn 100 words", test: (s) => learnedCount(s) >= 100 },
  { id: "w400", icon: "🏰", name: "Wortschatz", desc: "Learn 400 words", test: (s) => learnedCount(s) >= 400 },
  { id: "m50", icon: "🧠", name: "Langzeitgedächtnis", desc: "Master 50 words", test: (s) => masteredCount(s) >= 50 },
  { id: "s3", icon: "🔥", name: "Warm gelaufen", desc: "3-day streak", test: (s) => s.streak.best >= 3 },
  { id: "s7", icon: "🌋", name: "Eine Woche", desc: "7-day streak", test: (s) => s.streak.best >= 7 },
  { id: "s30", icon: "☄️", name: "Unaufhaltsam", desc: "30-day streak", test: (s) => s.streak.best >= 30 },
  { id: "perfect", icon: "💎", name: "Fehlerfrei", desc: "A session with zero mistakes", test: (s) => s.stats.perfect >= 1 },
  { id: "combo15", icon: "⚡", name: "Kettenreaktion", desc: "15× answer combo", test: (s) => s.stats.maxCombo >= 15 },
  { id: "g1", icon: "📐", name: "Grammatik-Fan", desc: "Pass a grammar lesson", test: (s) => grammarDone(s) >= 1 },
  { id: "g10", icon: "🏛️", name: "Grammatik-Profi", desc: "Pass 10 grammar lessons", test: (s) => grammarDone(s) >= 10 },
  { id: "blitz25", icon: "🌩️", name: "Blitzmerker", desc: "Score 25 in Artikel-Blitz", test: (s) => s.games.blitz >= 25 },
  { id: "match", icon: "🧩", name: "Paarweise", desc: "Score 1000 in Wort-Paare", test: (s) => s.games.match >= 1000 },
  { id: "gym", icon: "🏋️", name: "Verb-Athlet", desc: "Score 15 in the Verb Gym", test: (s) => s.games.gym >= 15 },
  { id: "custom", icon: "✍️", name: "Eigene Wörter", desc: "Add a word of your own", test: (s) => s.custom.length >= 1 },
  { id: "xp1000", icon: "🏆", name: "Tausender", desc: "Earn 1,000 XP", test: (s) => s.xp >= 1000 },
  { id: "l10", icon: "👑", name: "Level 10", desc: "Reach level 10", test: (s) => levelInfo(s.xp).level >= 10 },
];

function postProcess(before, s) {
  const lb = levelInfo(before.xp).level, la = levelInfo(s.xp).level;
  if (la > lb) emit({ type: "levelup", level: la, title: levelInfo(s.xp).title });
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements[a.id] && a.test(s)) {
      s.achievements[a.id] = Date.now();
      emit({ type: "achievement", ach: a });
    }
  }
  const t = today();
  const dBefore = before.days[t];
  if (dBefore && before.goal && dBefore.xp < before.goal && s.days[t] && s.days[t].xp >= s.goal) emit({ type: "goal" });
}

export function claimQuest(id) {
  setState((s) => {
    const d = dayOf(s);
    if (d.quests.includes(id)) return;
    d.quests.push(id);
    s.xp += 15;
    d.xp += 15;
  });
}

export function resetAll() {
  state = initial();
  persist();
  listeners.forEach((l) => l());
}

export function importState(json) {
  const parsed = JSON.parse(json);
  if (!parsed || parsed.version !== 2) throw new Error("Not a Deutsch Flashcard backup");
  state = { ...initial(), ...parsed };
  persist();
  listeners.forEach((l) => l());
}

export const stats = { learnedCount, masteredCount, grammarDone };
