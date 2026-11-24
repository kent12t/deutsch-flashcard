import React, { useMemo, useState } from "react";
import { useApp } from "../App";
import { Button, Ring, Bar, Speaker, Sheet, ArticleTag, Icon } from "../components/ui";
import { useStore, questsFor, claimQuest, today, MASTERED_BOX, isDue, liveStreak } from "../lib/store";
import { LEVELS, UNITS } from "../data/curriculum";
import { grammarById } from "../data/grammar";
import { learnSession, practiceSession } from "../lib/questions";
import { displayDe } from "../lib/words";
import { play } from "../lib/fx";

export function unitProgress(unit, words, progress, grammar) {
  const uw = words.filter((w) => w.unit === unit.id);
  const learned = uw.filter((w) => progress[w.key]?.c > 0).length;
  const mastered = uw.filter((w) => progress[w.key]?.b >= MASTERED_BOX).length;
  const gDone = !!grammar[unit.grammar]?.done;
  const pct = uw.length ? learned / uw.length : 0;
  return { total: uw.length, learned, mastered, gDone, pct, complete: pct >= 0.8 && gDone, words: uw };
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Gute Nacht" : h < 11 ? "Guten Morgen" : h < 17 ? "Guten Tag" : "Guten Abend";
};

export default function Home() {
  const s = useStore();
  const { words, startSession, openLesson } = useApp();
  const [openUnit, setOpenUnit] = useState(null);
  const todayXp = s.days[today()]?.xp || 0;
  const quests = questsFor(s);
  const due = useMemo(() => words.filter((w) => isDue(s.words[w.key])), [words, s.words]);
  const dueUnique = [...new Map(due.map((w) => [w.key, w])).values()];

  const progressByUnit = useMemo(() => Object.fromEntries(UNITS.map((u) => [u.id, unitProgress(u, words, s.words, s.grammar)])), [words, s.words, s.grammar]);
  const nextUnit = UNITS.find((u) => !progressByUnit[u.id].complete) || UNITS[UNITS.length - 1];
  const np = progressByUnit[nextUnit.id];

  const wotd = useMemo(() => {
    const pool = words.filter((w) => w.src === "core" && w.level !== "A1");
    let h = 0;
    for (const c of today()) h = (h * 33 + c.charCodeAt(0)) >>> 0;
    return pool[h % pool.length];
  }, [words]);

  function continueLearning() {
    const unitWords = np.words;
    if (np.learned < np.total) {
      startSession({ title: `${nextUnit.de} · New words`, questions: learnSession(unitWords, s.words, words) });
    } else if (!np.gDone) {
      openLesson(nextUnit.grammar);
    } else {
      startSession({ title: `${nextUnit.de} · Practice`, questions: practiceSession(unitWords, s.words, words) });
    }
  }

  const streak = liveStreak(s);
  const isFresh = s.xp === 0;

  return (
    <div className="page">
      <section className="hero card">
        <div className="hero-text">
          <p className="eyebrow">{greeting()}!</p>
          <h1 className="hero-title">{isFresh ? "Let's start your German journey." : streak > 1 ? `${streak} days in a row. Keep it going!` : "Ready for today's German?"}</h1>
          <div className="hero-next">
            <span className="unit-icon sm">{nextUnit.icon}</span>
            <div>
              <div className="muted small">Up next · {nextUnit.level}</div>
              <b>{nextUnit.de}</b>
            </div>
          </div>
          <div className="hero-actions">
            <Button size="lg" onClick={continueLearning}>
              {isFresh ? "Start learning" : "Continue"} <Icon name="chevron" size={18} />
            </Button>
            {dueUnique.length > 0 && (
              <Button variant="secondary" size="lg" onClick={() => startSession({ title: "Daily review", mode: "review", questions: practiceSession(dueUnique, s.words, words, { count: 15 }) })}>
                🔁 Review {Math.min(15, dueUnique.length)}
              </Button>
            )}
          </div>
        </div>
        <div className="hero-goal">
          <Ring value={todayXp / s.goal} size={108} stroke={10} color={todayXp >= s.goal ? "var(--ok)" : "var(--gold)"}>
            <div className="goal-label">
              <b>{todayXp}</b>
              <span>/ {s.goal} XP</span>
            </div>
          </Ring>
          <span className="muted small">Tagesziel</span>
        </div>
      </section>

      <section className="card quests">
        <div className="card-head">
          <h2>Daily quests</h2>
          <span className="muted small">+15 XP each</span>
        </div>
        {quests.map((q) => (
          <div key={q.id} className={`quest ${q.done ? "done" : ""}`}>
            <span className="quest-icon">{q.icon}</span>
            <div className="quest-body">
              <div className="quest-text">{q.text}</div>
              <Bar value={q.value / q.goal} color={q.done ? "var(--ok)" : "var(--gold)"} thin />
            </div>
            {q.claimed ? (
              <span className="quest-claimed">✓</span>
            ) : q.done ? (
              <button
                className="btn btn-gold btn-sm"
                onClick={() => {
                  play("combo");
                  claimQuest(q.id);
                }}
              >
                Claim
              </button>
            ) : (
              <span className="muted small">
                {q.value}/{q.goal}
              </span>
            )}
          </div>
        ))}
      </section>

      {wotd && (
        <section className={`card wotd g-${wotd.art || "none"}`}>
          <div className="eyebrow">Wort des Tages</div>
          <div className="wotd-word">
            <ArticleTag art={wotd.art} /> {wotd.de} <Speaker text={displayDe(wotd)} />
          </div>
          <div className="muted">
            {wotd.en}
            {wotd.pl && wotd.pl !== wotd.de ? ` · Pl. ${wotd.pl}` : ""}
          </div>
        </section>
      )}

      {LEVELS.map((lv) => {
        const units = UNITS.filter((u) => u.level === lv.id);
        const done = units.filter((u) => progressByUnit[u.id].complete).length;
        return (
          <section key={lv.id} className="level">
            <div className="level-head">
              <div>
                <h2>{lv.name}</h2>
                <p className="muted small">{lv.blurb}</p>
              </div>
              <span className="level-count">
                {done}/{units.length}
              </span>
            </div>
            <div className="path">
              {units.map((u, i) => {
                const p = progressByUnit[u.id];
                const current = u.id === nextUnit.id;
                return (
                  <button key={u.id} className={`unit ${p.complete ? "complete" : ""} ${current ? "current" : ""}`} onClick={() => setOpenUnit(u)} style={{ "--offset": `${Math.sin(i * 1.1) * 18}px` }}>
                    <Ring value={p.pct} size={64} stroke={5} color={p.complete ? "var(--ok)" : "var(--gold)"}>
                      <span className="unit-icon">{u.icon}</span>
                    </Ring>
                    <div className="unit-text">
                      <b>{u.de}</b>
                      <span className="muted small">{u.en}</span>
                      <span className="unit-meta">
                        {p.learned}/{p.total} words {p.gDone ? "· 📐✓" : ""} {u.quiz ? <span className="chip tiny">class</span> : null}
                      </span>
                    </div>
                    {current && <span className="now-tag">Up next</span>}
                    {p.complete && <span className="done-tag">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <UnitSheet unit={openUnit} onClose={() => setOpenUnit(null)} progress={openUnit && progressByUnit[openUnit.id]} />
    </div>
  );
}

function UnitSheet({ unit, onClose, progress }) {
  const s = useStore();
  const { words, startSession, openLesson } = useApp();
  if (!unit) return null;
  const g = grammarById[unit.grammar];
  const left = progress.total - progress.learned;
  const go = (cfg) => {
    onClose();
    startSession(cfg);
  };
  return (
    <Sheet open title={`${unit.icon} ${unit.de}`} onClose={onClose}>
      <p className="muted">
        {unit.en} · {unit.level}
        {unit.quiz ? ` · from your class (Quiz ${unit.quiz})` : ""}
      </p>
      <div className="unit-stats">
        <div>
          <b>{progress.learned}</b>
          <span>learned</span>
        </div>
        <div>
          <b>{progress.mastered}</b>
          <span>mastered</span>
        </div>
        <div>
          <b>{progress.total}</b>
          <span>words</span>
        </div>
      </div>
      <div className="sheet-actions">
        <button className="action-row" onClick={() => go({ title: `${unit.de} · New words`, questions: learnSession(progress.words, s.words, words) })} disabled={left === 0}>
          <span className="action-icon">🌱</span>
          <span>
            <b>Learn new words</b>
            <small>{left ? `${left} words left` : "All words introduced"}</small>
          </span>
          <Icon name="chevron" />
        </button>
        <button className="action-row" onClick={() => go({ title: `${unit.de} · Practice`, questions: practiceSession(progress.words.filter((w) => s.words[w.key]), s.words, words) })} disabled={progress.learned === 0}>
          <span className="action-icon">🎯</span>
          <span>
            <b>Practise</b>
            <small>Mixed questions on words you know</small>
          </span>
          <Icon name="chevron" />
        </button>
        {g && (
          <button
            className="action-row"
            onClick={() => {
              onClose();
              openLesson(g.id);
            }}
          >
            <span className="action-icon">{g.icon}</span>
            <span>
              <b>Grammar: {g.title}</b>
              <small>{progress.gDone ? `Completed · best ${Math.round((s.grammar[g.id]?.best || 0) * 100)}%` : g.en}</small>
            </span>
            {progress.gDone ? <span className="done-tag inline">✓</span> : <Icon name="chevron" />}
          </button>
        )}
        <button className="action-row" onClick={() => go({ title: `${unit.de} · Exam mode`, questions: practiceSession(progress.words, s.words, words, { count: 15, strict: true }) })}>
          <span className="action-icon">📝</span>
          <span>
            <b>Exam mode</b>
            <small>Type everything — articles {unit.quiz ? "and plurals" : "included"}</small>
          </span>
          <Icon name="chevron" />
        </button>
      </div>
      <details className="word-preview">
        <summary>Word list ({progress.total})</summary>
        <ul>
          {progress.words.map((w) => (
            <li key={w.key + w.en}>
              <span>
                <ArticleTag art={w.art} /> {w.de}
              </span>
              <span className="muted">{w.en}</span>
            </li>
          ))}
        </ul>
      </details>
    </Sheet>
  );
}
