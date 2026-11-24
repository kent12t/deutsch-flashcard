import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bar, Button, Icon, Rich, Speaker, ArticleTag, UmlautBar } from "../components/ui";
import { check, sentenceKey } from "../lib/answer";
import { play, speak, confetti } from "../lib/fx";
import { setState, addXP, recordWord, dayOf, getState, useStore, today } from "../lib/store";
import { displayDe, TYPE_LABEL } from "../lib/words";

const ARTICLES = ["der", "die", "das"];

export default function Session({ title, questions, onExit, mode = "words", grammarId, onFinish }) {
  const [queue, setQueue] = useState(questions);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("answer"); // answer | feedback | done
  const [result, setResult] = useState(null);
  const [combo, setCombo] = useState(0);
  const run = useRef({ xp: 0, correct: 0, answered: 0, maxCombo: 0, mistakes: [], retried: new Set(), start: Date.now() });
  const autoSpeak = useStore((s) => s.settings.autoSpeak);

  const q = queue[idx];
  const graded = queue.filter((x) => x.kind !== "intro").length;
  const progress = phase === "done" ? 1 : queue.slice(0, idx).filter((x) => x.kind !== "intro").length / Math.max(1, graded);

  function grade(ok, info = {}) {
    if (phase !== "answer") return;
    const r = run.current;
    const firstTry = !q.retry;
    const newCombo = ok ? combo + 1 : 0;
    let gained = 0;
    if (ok) {
      gained = Math.round((q.xp || 10) * (info.typo ? 0.5 : 1) * (firstTry ? 1 : 0.5)) + (newCombo >= 10 ? 4 : newCombo >= 5 ? 2 : 0);
      play(newCombo > 0 && newCombo % 5 === 0 ? "combo" : "correct");
    } else play("wrong");
    if (firstTry) {
      r.answered++;
      if (ok) r.correct++;
    }
    if (!ok) {
      if (!r.retried.has(idx) && !q.retry) {
        r.retried.add(idx);
        setQueue((qq) => [...qq, { ...q, retry: true }]);
      }
      if (!q.retry) r.mistakes.push({ q, given: info.given });
    }
    r.xp += gained;
    r.maxCombo = Math.max(r.maxCombo, newCombo);
    setCombo(newCombo);
    setState((s) => {
      addXP(s, gained);
      const d = dayOf(s);
      d.answered++;
      if (ok) d.correct++;
      d.maxCombo = Math.max(d.maxCombo, newCombo);
      s.stats.answered++;
      if (ok) s.stats.correct++;
      s.stats.maxCombo = Math.max(s.stats.maxCombo, newCombo);
      if (q.key && firstTry) {
        recordWord(s, q.key, ok, { soft: q.kind === "mc" || q.kind === "article" });
        if (mode === "review") d.reviews++;
      }
    });
    if (q.speakText && (q.word || q.listen) && autoSpeak) speak(q.speakText);
    setResult({ ok, gained, ...info });
    setPhase("feedback");
  }

  function next() {
    if (idx + 1 >= queue.length) return finish();
    setIdx(idx + 1);
    setResult(null);
    setPhase("answer");
  }

  function finish() {
    const r = run.current;
    const perfect = r.answered >= 5 && r.correct === r.answered;
    const pct = r.answered ? r.correct / r.answered : 1;
    setState((s) => {
      s.stats.sessions++;
      const d = dayOf(s);
      if (perfect) {
        s.stats.perfect++;
        d.perfect++;
        addXP(s, 10);
      }
      if (mode === "grammar" && grammarId) {
        const g = (s.grammar[grammarId] = s.grammar[grammarId] || { best: 0, done: false, attempts: 0 });
        g.attempts++;
        g.best = Math.max(g.best, pct);
        if (pct >= 0.7) g.done = true;
        d.grammar++;
      }
    });
    if (perfect) r.xp += 10;
    play("finish");
    if (pct >= 0.8) confetti();
    setPhase("done");
    onFinish?.({ pct, xp: r.xp });
  }

  // Enter to continue
  useEffect(() => {
    if (phase !== "feedback" && phase !== "answer") return;
    const onKey = (e) => {
      if (phase === "feedback" && e.key === "Enter") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!queue.length)
    return (
      <div className="session">
        <SessionTop onExit={onExit} progress={0} combo={0} title={title} />
        <div className="session-empty">
          <div className="big-emoji">🎉</div>
          <h2>Nothing to do here</h2>
          <p className="muted">You&rsquo;re all caught up. Try another mode!</p>
          <Button onClick={onExit}>Back</Button>
        </div>
      </div>
    );

  if (phase === "done") return <Summary run={run.current} title={title} onExit={onExit} mode={mode} />;

  return (
    <div className="session">
      <SessionTop onExit={onExit} progress={progress} combo={combo} title={title} />
      <div className="session-body" key={idx}>
        {q.retry && <div className="retry-tag">↺ Let&rsquo;s try that one again</div>}
        {q.kind === "intro" && <Intro q={q} onNext={next} autoSpeak={autoSpeak} />}
        {q.kind === "mc" && <Choice q={q} onAnswer={grade} phase={phase} autoSpeak={autoSpeak} />}
        {q.kind === "article" && <ArticleQ q={q} onAnswer={grade} phase={phase} />}
        {q.kind === "type" && <TypeQ q={q} onAnswer={grade} phase={phase} />}
        {q.kind === "order" && <OrderQ q={q} onAnswer={grade} phase={phase} />}
      </div>
      {phase === "feedback" && <Feedback q={q} result={result} onNext={next} />}
    </div>
  );
}

function SessionTop({ onExit, progress, combo, title }) {
  return (
    <div className="session-top">
      <button className="icon-btn" onClick={onExit} aria-label="Quit session">
        <Icon name="x" />
      </button>
      <div className="session-progress" title={title}>
        <Bar value={progress} color="var(--ok)" />
      </div>
      <div className={`combo ${combo >= 3 ? "on" : ""} ${combo >= 10 ? "hot" : ""}`} aria-label={`Combo ${combo}`}>
        🔥<b>{combo}</b>
      </div>
    </div>
  );
}

function WordHead({ word }) {
  return (
    <div className="word-meta">
      <span className={`chip chip-${word.type}`}>{TYPE_LABEL[word.type]}{word.vt === "2" ? " · Vokalwechsel" : word.vt === "3" ? " · unregelmäßig" : ""}</span>
      {word.src === "class" && <span className="chip">Quiz {word.quiz}</span>}
      {word.src === "custom" && <span className="chip">★ Mine</span>}
    </div>
  );
}

function Intro({ q, onNext, autoSpeak }) {
  const w = q.word;
  useEffect(() => {
    if (autoSpeak) speak(displayDe(w));
  }, []);
  useEffect(() => {
    const k = (e) => e.key === "Enter" && onNext();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  return (
    <div className="q">
      <div className="q-label new-label">✨ New word</div>
      <div className={`intro-card ${w.art ? "g-" + w.art : ""}`}>
        <WordHead word={w} />
        <div className="intro-de">
          <ArticleTag art={w.art} /> {w.de}
          <Speaker text={displayDe(w)} size={24} />
        </div>
        {w.pl && w.pl !== w.de && <div className="intro-pl">Plural: die {w.pl}</div>}
        {w.pl && w.pl === w.de && <div className="intro-pl">Plural: die {w.pl} (no change)</div>}
        <div className="intro-en">{w.en}</div>
        {w.art && <GenderHint word={w} />}
      </div>
      <div className="q-actions">
        <Button size="lg" block onClick={onNext}>Got it</Button>
      </div>
    </div>
  );
}

function GenderHint({ word }) {
  const de = word.de.toLowerCase();
  const rules = [
    [/(ung|heit|keit|schaft|ion|tät|ik|ur|enz|anz)$/, "die", "-ung/-heit/-keit/-schaft/-ion/-tät endings are always feminine"],
    [/(chen|lein)$/, "das", "-chen/-lein diminutives are always neuter"],
    [/(ment|um|ma)$/, "das", "-ment/-um endings are usually neuter"],
    [/(ismus|ling|or)$/, "der", "-ismus/-ling/-or endings are masculine"],
    [/in$/, "die", "-in for female people is always feminine"],
    [/e$/, "die", "Most nouns ending in -e are feminine"],
  ];
  const hit = rules.find(([re, art]) => re.test(de) && art === word.art);
  if (!hit) return null;
  return <div className="hint">💡 {hit[2]}</div>;
}

function Choice({ q, onAnswer, phase, autoSpeak }) {
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    if (q.speakPrompt && autoSpeak) speak(q.prompt);
  }, []);
  useEffect(() => {
    const k = (e) => {
      const n = parseInt(e.key, 10);
      if (phase === "answer" && n >= 1 && n <= q.options.length) choose(n - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  function choose(i) {
    if (phase !== "answer") return;
    setPicked(i);
    onAnswer(i === q.answer, { given: q.options[i] });
  }
  return (
    <div className="q">
      <div className="q-label">{q.label}</div>
      {q.word && <WordHead word={q.word} />}
      <div className={`q-prompt ${q.gap ? "q-sentence" : ""}`}>
        <GapText text={q.prompt} />
        {q.speakPrompt && <Speaker text={q.prompt} />}
      </div>
      <div className="options">
        {q.options.map((o, i) => {
          let cls = "";
          if (phase === "feedback") {
            if (i === q.answer) cls = "opt-ok";
            else if (i === picked) cls = "opt-bad";
            else cls = "opt-dim";
          }
          return (
            <button key={i} className={`option ${cls}`} onClick={() => choose(i)} disabled={phase !== "answer"}>
              <kbd>{i + 1}</kbd>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GapText({ text }) {
  const parts = String(text).split("___");
  return (
    <span>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p}
          {i < parts.length - 1 && <span className="gap">&nbsp;</span>}
        </React.Fragment>
      ))}
    </span>
  );
}

function ArticleQ({ q, onAnswer, phase }) {
  const [picked, setPicked] = useState(null);
  useEffect(() => {
    const k = (e) => {
      const n = parseInt(e.key, 10);
      if (phase === "answer" && n >= 1 && n <= 3) choose(ARTICLES[n - 1]);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  function choose(a) {
    if (phase !== "answer") return;
    setPicked(a);
    onAnswer(a === q.answer, { given: a });
  }
  return (
    <div className="q">
      <div className="q-label">{q.label}</div>
      <div className="q-prompt">
        <span className="gap gap-art">{phase === "feedback" ? q.answer : "?"}</span> {q.prompt}
      </div>
      <div className="q-sub">{q.sub}</div>
      <div className="article-row">
        {ARTICLES.map((a, i) => (
          <button key={a} className={`art-btn art-btn-${a} ${phase === "feedback" ? (a === q.answer ? "opt-ok" : a === picked ? "opt-bad" : "opt-dim") : ""}`} onClick={() => choose(a)} disabled={phase !== "answer"}>
            <kbd>{i + 1}</kbd>
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypeQ({ q, onAnswer, phase }) {
  const [text, setText] = useState("");
  const [plural, setPlural] = useState("");
  const [art, setArt] = useState(null);
  const ref = useRef(null);
  const plRef = useRef(null);
  const [focusPl, setFocusPl] = useState(false);

  useEffect(() => {
    if (q.listen) setTimeout(() => speak(q.speakText), 250);
    setTimeout(() => ref.current?.focus(), 50);
  }, []);

  function submit(e) {
    e?.preventDefault();
    if (phase !== "answer" || !text.trim()) return;
    let input = text.trim();
    let chosenArt = art;
    const m = input.match(/^(der|die|das)\s+(.+)$/i);
    if (q.needArticle && m) {
      chosenArt = m[1].toLowerCase();
      input = m[2];
    }
    const res = check(input, q.answer, { caseNote: q.word?.type === "noun" ? "German nouns are always capitalised" : undefined });
    let ok = res.ok;
    const notes = [];
    if (res.note) notes.push(res.note);
    if (q.needArticle && chosenArt !== q.needArticle) {
      ok = false;
      notes.unshift(chosenArt ? `Wrong article — it's **${q.needArticle}** ${q.answer}` : `Don't forget the article: **${q.needArticle}**`);
    }
    if (q.needPlural) {
      const pr = check(plural.replace(/^die\s+/i, ""), q.needPlural, { typos: false });
      if (!pr.ok) {
        ok = false;
        notes.push(`Plural: **die ${q.needPlural}**`);
      }
    }
    onAnswer(ok, { given: (chosenArt ? chosenArt + " " : "") + input, note: notes.join(" · "), typo: res.typo });
  }

  return (
    <form className="q" onSubmit={submit}>
      <div className="q-label">{q.label}</div>
      {q.word && !q.listen && <WordHead word={q.word} />}
      {q.listen ? (
        <div className="listen-row">
          <button type="button" className="listen-btn" onClick={() => speak(q.speakText)} aria-label="Play again">
            <Icon name="volume" size={40} />
          </button>
          <button type="button" className="listen-btn slow" onClick={() => speak(q.speakText, 0.55)} aria-label="Play slowly">
            🐢
          </button>
        </div>
      ) : (
        <div className={`q-prompt ${q.gap ? "q-sentence" : ""}`}>
          {q.prefix && <span className="muted">{q.prefix} </span>}
          <GapText text={q.prompt} />
        </div>
      )}
      {q.sub && !q.listen && <div className="q-sub">{q.sub}</div>}

      {q.needArticle && (
        <div className="article-row small">
          {ARTICLES.map((a) => (
            <button type="button" key={a} className={`art-btn art-btn-${a} ${art === a ? "selected" : ""}`} onClick={() => setArt(a)} disabled={phase !== "answer"}>
              {a}
            </button>
          ))}
        </div>
      )}

      <input
        ref={ref}
        className="answer-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocusPl(false)}
        placeholder={q.listen ? "What did you hear?" : q.gap ? "Type the missing part" : "Auf Deutsch…"}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        disabled={phase !== "answer"}
        lang="de"
      />
      {q.needPlural && (
        <input
          ref={plRef}
          className="answer-input"
          value={plural}
          onFocus={() => setFocusPl(true)}
          onChange={(e) => setPlural(e.target.value)}
          placeholder="Plural (die …)"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={phase !== "answer"}
          lang="de"
        />
      )}
      {phase === "answer" && <UmlautBar inputRef={focusPl ? plRef : ref} onInsert={(v) => (focusPl ? setPlural(v) : setText(v))} />}
      {phase === "answer" && (
        <div className="q-actions">
          <Button type="button" variant="ghost" onClick={() => onAnswer(false, { given: "", skipped: true })}>
            I don&rsquo;t know
          </Button>
          <Button type="submit" size="lg" disabled={!text.trim()}>
            Check
          </Button>
        </div>
      )}
    </form>
  );
}

function OrderQ({ q, onAnswer, phase }) {
  const tiles = useMemo(() => q.tiles.map((t, i) => ({ t, i })), [q]);
  const [chosen, setChosen] = useState([]);
  const bank = tiles.filter((x) => !chosen.includes(x.i));
  function submit() {
    if (phase !== "answer" || !chosen.length) return;
    const sentence = chosen.map((i) => tiles[i].t).join(" ");
    const ok = [q.answer, ...q.alt].some((a) => sentenceKey(a) === sentenceKey(sentence));
    onAnswer(ok, { given: sentence });
  }
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Enter" && phase === "answer") submit();
      if (e.key === "Backspace" && phase === "answer") setChosen((c) => c.slice(0, -1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  return (
    <div className="q">
      <div className="q-label">{q.label}</div>
      <div className="q-prompt q-sentence">“{q.prompt}”</div>
      <div className="order-line">
        {chosen.map((i) => (
          <button key={i} className="tile placed" onClick={() => phase === "answer" && (play("tap"), setChosen(chosen.filter((c) => c !== i)))}>
            {tiles[i].t}
          </button>
        ))}
        {!chosen.length && <span className="muted order-hint">Tap the words in order</span>}
      </div>
      <div className="order-bank">
        {bank.map((x) => (
          <button key={x.i} className="tile" onClick={() => phase === "answer" && (play("tap"), setChosen([...chosen, x.i]))}>
            {x.t}
          </button>
        ))}
      </div>
      {phase === "answer" && (
        <div className="q-actions">
          <Button variant="ghost" onClick={() => setChosen([])} disabled={!chosen.length}>
            Clear
          </Button>
          <Button size="lg" onClick={submit} disabled={chosen.length !== tiles.length}>
            Check
          </Button>
        </div>
      )}
    </div>
  );
}

function correctText(q) {
  if (q.kind === "mc") return q.options[q.answer];
  if (q.kind === "article") return `${q.answer} ${q.prompt}`;
  if (q.kind === "order") return q.answer;
  if (q.word && q.word.type === "noun" && q.needArticle) return `${q.word.art} ${q.word.de}${q.needPlural ? ` · die ${q.word.pl}` : ""}`;
  if (q.prefix) return `${q.prefix} ${q.answer}`;
  return String(q.answer).split("|")[0];
}

const PRAISE = ["Richtig!", "Super!", "Genau!", "Klasse!", "Sehr gut!", "Toll!", "Perfekt!", "Wunderbar!"];

function Feedback({ q, result, onNext }) {
  const praise = useMemo(() => PRAISE[(Math.random() * PRAISE.length) | 0], []);
  const w = q.word;
  return (
    <div className={`feedback ${result.ok ? "fb-ok" : "fb-bad"}`} role="status">
      <div className="fb-inner">
        <div className="fb-head">
          <span className="fb-title">{result.ok ? praise : result.skipped ? "Here's the answer" : "Nicht ganz…"}</span>
          {result.gained > 0 && <span className="fb-xp">+{result.gained} XP</span>}
        </div>
        {(!result.ok || q.kind === "mc" || q.word) && (
          <div className="fb-answer">
            {!result.ok && <span className="fb-label">Correct answer:</span>}
            <span className="fb-correct">
              {correctText(q)}
              {w && <Speaker text={displayDe(w)} size={18} />}
            </span>
            {w && <span className="fb-en">{w.en}</span>}
          </div>
        )}
        {result.note && (
          <div className="fb-note">
            <Rich text={result.note} />
          </div>
        )}
        {q.explain && (
          <div className="fb-note">
            💡 <Rich text={q.explain} />
          </div>
        )}
        <Button variant={result.ok ? "ok" : "bad"} size="lg" block onClick={onNext}>
          Weiter
        </Button>
      </div>
    </div>
  );
}

function Summary({ run, title, onExit, mode }) {
  const pct = run.answered ? Math.round((run.correct / run.answered) * 100) : 100;
  const secs = Math.round((Date.now() - run.start) / 1000);
  const s = getState();
  const headline = pct === 100 ? "Fehlerfrei! 💎" : pct >= 80 ? "Ausgezeichnet!" : pct >= 60 ? "Gut gemacht!" : "Weiter üben!";
  return (
    <div className="session summary">
      <div className="summary-body">
        <div className="big-emoji pop">{pct >= 80 ? "🏆" : pct >= 60 ? "💪" : "🌱"}</div>
        <h2>{headline}</h2>
        <p className="muted">{title}</p>
        <div className="summary-stats">
          <div className="stat-tile gold">
            <span>XP</span>
            <b>+{run.xp}</b>
          </div>
          <div className={`stat-tile ${pct >= 80 ? "green" : pct >= 60 ? "blue" : "red"}`}>
            <span>Accuracy</span>
            <b>{pct}%</b>
          </div>
          <div className="stat-tile orange">
            <span>Best combo</span>
            <b>{run.maxCombo}</b>
          </div>
          <div className="stat-tile">
            <span>Time</span>
            <b>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</b>
          </div>
        </div>
        {mode === "grammar" && pct < 70 && <p className="muted">Score 70% or more to complete the lesson.</p>}
        {run.mistakes.length > 0 && (
          <div className="mistakes">
            <h3>Review these</h3>
            {run.mistakes.slice(0, 8).map((m, i) => (
              <div key={i} className="mistake">
                <div>
                  <div className="mistake-prompt">{m.q.word ? m.q.word.en : m.q.prompt}</div>
                  {m.given && <div className="mistake-given">You: {m.given}</div>}
                </div>
                <div className="mistake-correct">{m.q.word ? displayDe(m.q.word) : correctText(m.q)}</div>
              </div>
            ))}
          </div>
        )}
        <p className="muted small">Daily goal: {Math.min(s.days[today()]?.xp || 0, s.goal)} / {s.goal} XP</p>
      </div>
      <div className="summary-actions">
        <Button size="lg" block onClick={onExit}>
          Continue
        </Button>
      </div>
    </div>
  );
}
