import React, { useMemo, useState } from "react";
import { useApp } from "../App";
import { Button, Icon } from "../components/ui";
import { useStore, isDue } from "../lib/store";
import { practiceSession, wordQuestion, shuffle } from "../lib/questions";
import { canSpeak } from "../lib/fx";

const uniq = (ws) => [...new Map(ws.map((w) => [w.key, w])).values()];

export default function Practice() {
  const s = useStore();
  const { words, startSession, openGame } = useApp();
  const [quizzes, setQuizzes] = useState(["1", "2", "3", "4"]);
  const [levels, setLevels] = useState(["A1"]);

  const known = useMemo(() => uniq(words.filter((w) => s.words[w.key]?.c > 0)), [words, s.words]);
  const due = useMemo(() => uniq(words.filter((w) => isDue(s.words[w.key]))), [words, s.words]);
  const weak = useMemo(
    () =>
      uniq(words.filter((w) => s.words[w.key]?.w > 0))
        .sort((a, b) => s.words[b.key].w / (s.words[b.key].c + 1) - s.words[a.key].w / (s.words[a.key].c + 1))
        .slice(0, 20),
    [words, s.words]
  );
  const classWords = words.filter((w) => w.src === "class" && quizzes.includes(w.quiz));
  const levelWords = uniq(words.filter((w) => levels.includes(w.level) && w.src !== "custom"));
  const customWords = words.filter((w) => w.src === "custom");
  const toggle = (list, set, v) => set(list.includes(v) ? (list.length > 1 ? list.filter((x) => x !== v) : list) : [...list, v]);

  const go = (title, questions, mode) => startSession({ title, questions, mode });

  return (
    <div className="page">
      <h1 className="page-title">Üben</h1>

      <section className={`card review-card ${due.length ? "" : "calm"}`}>
        <div>
          <div className="eyebrow">Spaced repetition</div>
          <h2>{due.length ? `${due.length} words ready for review` : "Nothing due right now"}</h2>
          <p className="muted small">{due.length ? "Reviewing at the right moment moves words into long-term memory." : known.length ? "Come back later — your words are resting in memory." : "Learn some words first on the Lernen tab."}</p>
        </div>
        <Button size="lg" disabled={!due.length} onClick={() => go("Daily review", practiceSession(due, s.words, words, { count: 15 }), "review")}>
          Review now
        </Button>
      </section>

      <h2 className="section-title">Arcade</h2>
      <div className="game-grid">
        <button className="game-card g-blitz" onClick={() => openGame("blitz")}>
          <span className="game-emoji">🌩️</span>
          <b>Artikel-Blitz</b>
          <small>der, die or das? 60 seconds.</small>
          <span className="game-best">Best: {s.games.blitz}</span>
        </button>
        <button className="game-card g-match" onClick={() => openGame("match")}>
          <span className="game-emoji">🧩</span>
          <b>Wort-Paare</b>
          <small>Match German to English, fast.</small>
          <span className="game-best">Best: {s.games.match}</span>
        </button>
        <button className="game-card g-gym" onClick={() => openGame("gym")}>
          <span className="game-emoji">🏋️</span>
          <b>Verb-Gym</b>
          <small>Conjugation sprints.</small>
          <span className="game-best">Best: {s.games.gym}</span>
        </button>
        <button
          className="game-card g-listen"
          disabled={!canSpeak()}
          onClick={() => {
            const pool = known.length >= 6 ? known : levelWords;
            go("Hör-Training", shuffle(pool).slice(0, 10).map((w) => wordQuestion(w, "listen", words)));
          }}
        >
          <span className="game-emoji">🎧</span>
          <b>Hör-Training</b>
          <small>{canSpeak() ? "Hear it, type it." : "Needs speech support"}</small>
          <span className="game-best">10 words</span>
        </button>
      </div>

      <h2 className="section-title">Focus</h2>
      <div className="stack">
        <button className="action-row card" disabled={!weak.length} onClick={() => go("Weak words", practiceSession(weak, s.words, words, { count: 12 }))}>
          <span className="action-icon">🩹</span>
          <span>
            <b>Weak words</b>
            <small>{weak.length ? `Your ${weak.length} most-missed words` : "No mistakes yet — nice!"}</small>
          </span>
          <Icon name="chevron" />
        </button>

        <div className="card">
          <div className="card-head">
            <h3>🎲 Mixed practice</h3>
          </div>
          <div className="chips">
            {["A1", "A2", "B1"].map((l) => (
              <button key={l} className={`chip-toggle ${levels.includes(l) ? "on" : ""}`} onClick={() => toggle(levels, setLevels, l)}>
                {l}
              </button>
            ))}
          </div>
          <div className="row-between">
            <span className="muted small">{levelWords.length} words</span>
            <div className="row">
              <Button variant="secondary" onClick={() => go(`Mixed ${levels.join("+")}`, practiceSession(levelWords, s.words, words, { count: 12 }))}>
                Quick 12
              </Button>
              <Button variant="secondary" onClick={() => go(`Exam ${levels.join("+")}`, practiceSession(levelWords, s.words, words, { count: 15, strict: true }))}>
                Exam mode
              </Button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>🎓 Class decks</h3>
            <span className="muted small">your original quizzes</span>
          </div>
          <div className="chips">
            {["1", "2", "3", "4"].map((q) => (
              <button key={q} className={`chip-toggle ${quizzes.includes(q) ? "on" : ""}`} onClick={() => toggle(quizzes, setQuizzes, q)}>
                Quiz {q}
              </button>
            ))}
          </div>
          <div className="row-between">
            <span className="muted small">{classWords.length} words · strict typing with plurals</span>
            <Button variant="secondary" onClick={() => go(`Class · Quiz ${quizzes.join(", ")}`, practiceSession(classWords, s.words, words, { count: 15, strict: true }))}>
              Start
            </Button>
          </div>
        </div>

        <button className="action-row card" disabled={!customWords.length} onClick={() => go("My words", practiceSession(customWords, s.words, words, { count: 12 }))}>
          <span className="action-icon">✍️</span>
          <span>
            <b>My words</b>
            <small>{customWords.length ? `${customWords.length} words you added` : "Add your own words in the Wörter tab"}</small>
          </span>
          <Icon name="chevron" />
        </button>
      </div>
    </div>
  );
}
