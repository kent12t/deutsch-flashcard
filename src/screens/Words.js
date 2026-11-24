import React, { useMemo, useState } from "react";
import { useApp } from "../App";
import { Button, Icon, Sheet, Speaker, ArticleTag } from "../components/ui";
import { useStore, setState, MASTERED_BOX } from "../lib/store";
import { displayDe, TYPE_LABEL, wordKey } from "../lib/words";
import { UNITS } from "../data/curriculum";

const unitName = Object.fromEntries(UNITS.map((u) => [u.id, `${u.icon} ${u.de}`]));
unitName.custom = "★ My words";

function Dots({ box }) {
  const n = box == null ? 0 : Math.min(5, box);
  return (
    <span className="dots" aria-label={`Strength ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} />
      ))}
    </span>
  );
}

export default function Words() {
  const s = useStore();
  const { words } = useApp();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [sel, setSel] = useState(null);
  const [adding, setAdding] = useState(false);
  const [limit, setLimit] = useState(80);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const seen = new Set();
    return words.filter((w) => {
      const id = w.key + "|" + w.en;
      if (seen.has(id)) return false;
      seen.add(id);
      if (level !== "all" && w.level !== level) return false;
      if (type !== "all" && w.type !== type) return false;
      const p = s.words[w.key];
      if (status === "new" && p) return false;
      if (status === "learning" && !(p && p.b < MASTERED_BOX)) return false;
      if (status === "mastered" && !(p && p.b >= MASTERED_BOX)) return false;
      if (needle && !(w.de.toLowerCase().includes(needle) || w.en.toLowerCase().includes(needle))) return false;
      return true;
    });
  }, [words, q, level, status, type, s.words]);

  return (
    <div className="page">
      <div className="row-between">
        <h1 className="page-title">Wörter</h1>
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <Icon name="plus" size={16} /> Add word
        </Button>
      </div>
      <div className="search">
        <Icon name="search" size={18} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search German or English…" aria-label="Search words" />
      </div>
      <div className="filters">
        <select value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Level">
          <option value="all">All levels</option>
          <option>A1</option>
          <option>A2</option>
          <option>B1</option>
          <option value="★">My words</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
          <option value="all">All types</option>
          <option value="noun">Nouns</option>
          <option value="verb">Verbs</option>
          <option value="adj">Adjectives</option>
          <option value="other">Other</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="all">Any status</option>
          <option value="new">New</option>
          <option value="learning">Learning</option>
          <option value="mastered">Mastered</option>
        </select>
      </div>
      <p className="muted small">{list.length} words</p>
      <div className="word-list">
        {list.slice(0, limit).map((w) => (
          <button key={w.key + w.en + w.unit} className={`word-row g-${w.art || "none"}`} onClick={() => setSel(w)}>
            <span className="word-de">
              <ArticleTag art={w.art} /> {w.de}
            </span>
            <span className="word-en">{w.en}</span>
            <Dots box={s.words[w.key]?.b} />
          </button>
        ))}
      </div>
      {list.length > limit && (
        <Button variant="ghost" block onClick={() => setLimit(limit + 120)}>
          Show more
        </Button>
      )}
      <WordSheet w={sel} onClose={() => setSel(null)} />
      <AddWord open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function WordSheet({ w, onClose }) {
  const s = useStore();
  if (!w) return null;
  const p = s.words[w.key];
  return (
    <Sheet open title={TYPE_LABEL[w.type]} onClose={onClose}>
      <div className={`intro-card g-${w.art || "none"}`}>
        <div className="intro-de">
          <ArticleTag art={w.art} /> {w.de} <Speaker text={displayDe(w)} size={24} />
        </div>
        {w.pl && <div className="intro-pl">Plural: die {w.pl}</div>}
        <div className="intro-en">{w.en}</div>
      </div>
      <div className="unit-stats">
        <div>
          <b>{p?.c || 0}</b>
          <span>correct</span>
        </div>
        <div>
          <b>{p?.w || 0}</b>
          <span>missed</span>
        </div>
        <div>
          <b>
            <Dots box={p?.b} />
          </b>
          <span>strength</span>
        </div>
      </div>
      <p className="muted small">
        {unitName[w.unit]} · {w.level}
        {p ? ` · next review ${p.due <= Date.now() ? "now" : new Date(p.due).toLocaleDateString()}` : " · not learned yet"}
      </p>
      {w.src === "custom" && (
        <Button
          variant="ghost"
          onClick={() => {
            setState((st) => {
              st.custom = st.custom.filter((c) => wordKey(c) !== w.key);
            });
            onClose();
          }}
        >
          <Icon name="trash" size={16} /> Delete word
        </Button>
      )}
    </Sheet>
  );
}

function AddWord({ open, onClose }) {
  const [f, setF] = useState({ de: "", en: "", art: "", pl: "", type: "noun" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.de.trim() && f.en.trim() && (f.type !== "noun" || f.art);
  function save(e) {
    e.preventDefault();
    if (!valid) return;
    setState((s) => {
      s.custom.push({ de: f.de.trim(), en: f.en.trim(), art: f.type === "noun" ? f.art : null, pl: f.type === "noun" && f.pl.trim() ? f.pl.trim() : null, type: f.type, addedAt: Date.now() });
    });
    setF({ de: "", en: "", art: "", pl: "", type: f.type });
    onClose();
  }
  return (
    <Sheet open={open} title="Add your own word" onClose={onClose}>
      <form className="form" onSubmit={save}>
        <p className="muted small">Heard a word in a song, a show, on the street? Save it here and it joins your reviews.</p>
        <label>
          Type
          <div className="seg">
            {["noun", "verb", "adj", "other"].map((t) => (
              <button type="button" key={t} className={f.type === t ? "on" : ""} onClick={() => setF({ ...f, type: t })}>
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </label>
        {f.type === "noun" && (
          <label>
            Article
            <div className="article-row small">
              {["der", "die", "das"].map((a) => (
                <button type="button" key={a} className={`art-btn art-btn-${a} ${f.art === a ? "selected" : ""}`} onClick={() => setF({ ...f, art: a })}>
                  {a}
                </button>
              ))}
            </div>
          </label>
        )}
        <label>
          German
          <input value={f.de} onChange={set("de")} placeholder={f.type === "noun" ? "Schmetterling" : "z. B. träumen"} lang="de" />
        </label>
        {f.type === "noun" && (
          <label>
            Plural <span className="muted">(optional)</span>
            <input value={f.pl} onChange={set("pl")} placeholder="Schmetterlinge" lang="de" />
          </label>
        )}
        <label>
          English
          <input value={f.en} onChange={set("en")} placeholder="butterfly" />
        </label>
        <Button type="submit" size="lg" block disabled={!valid}>
          Save word
        </Button>
      </form>
    </Sheet>
  );
}
