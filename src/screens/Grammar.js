import React from "react";
import { useApp } from "../App";
import { Button, Header, Rich, Speaker, Icon } from "../components/ui";
import { useStore } from "../lib/store";
import { GRAMMAR, grammarById } from "../data/grammar";
import { LEVELS } from "../data/curriculum";
import { grammarSession } from "../lib/questions";

const stars = (best) => (best >= 0.95 ? 3 : best >= 0.85 ? 2 : best >= 0.7 ? 1 : 0);

export default function Grammar() {
  const s = useStore();
  const { openLesson } = useApp();
  const done = GRAMMAR.filter((g) => s.grammar[g.id]?.done).length;
  return (
    <div className="page">
      <h1 className="page-title">Grammatik</h1>
      <p className="muted">
        Short explanations, then practice. Pass with 70% — get ⭐⭐⭐ with a near-perfect run. {done}/{GRAMMAR.length} done.
      </p>
      {LEVELS.map((lv) => (
        <section key={lv.id}>
          <h2 className="section-title">{lv.name}</h2>
          <div className="stack">
            {GRAMMAR.filter((g) => g.level === lv.id).map((g) => {
              const p = s.grammar[g.id];
              const st = stars(p?.best || 0);
              return (
                <button key={g.id} className={`action-row card lesson-row ${p?.done ? "is-done" : ""}`} onClick={() => openLesson(g.id)}>
                  <span className="action-icon">{g.icon}</span>
                  <span>
                    <b>{g.title}</b>
                    <small>{g.en}</small>
                  </span>
                  <span className="stars" aria-label={`${st} stars`}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={i < st ? "on" : ""}>★</span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LessonView({ id }) {
  const g = grammarById[id];
  const s = useStore();
  const { close, startSession } = useApp();
  const p = s.grammar[id];
  const start = () => startSession({ title: g.title, questions: grammarSession(g), mode: "grammar", grammarId: g.id, back: { type: "lesson", id } });
  return (
    <div className="lesson">
      <Header title={g.title} onBack={close} />
      <div className="page lesson-body">
        <div className="lesson-hero">
          <span className="lesson-icon">{g.icon}</span>
          <div>
            <div className="eyebrow">
              {g.level} · Grammar
            </div>
            <h1>{g.en}</h1>
            {p && <div className="muted small">Best score: {Math.round(p.best * 100)}% · {p.attempts} attempt{p.attempts === 1 ? "" : "s"}</div>}
          </div>
        </div>
        {g.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
        <div className="lesson-cta">
          <Button size="lg" block onClick={start}>
            <Icon name="play" size={18} /> Practise · {g.exercises.length} exercises
          </Button>
        </div>
      </div>
    </div>
  );
}

function Block({ b }) {
  if (b.p)
    return (
      <p className="lesson-p">
        <Rich text={b.p} />
      </p>
    );
  if (b.tip)
    return (
      <div className="tip">
        <span>💡</span>
        <div>
          <Rich text={b.tip} />
        </div>
      </div>
    );
  if (b.table) {
    const [head, ...rows] = b.table;
    return (
      <div className="table-wrap">
        <table className="gtable">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>
                    <Rich text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (b.ex)
    return (
      <div className="examples">
        {b.ex.map(([de, en], i) => (
          <div key={i} className="example">
            <div className="example-de">
              {de} <Speaker text={de.replace(/^.*→\s*/, "")} size={16} />
            </div>
            <div className="example-en">{en}</div>
          </div>
        ))}
      </div>
    );
  return null;
}
