import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../App";
import { Button, Icon, Bar, UmlautBar } from "../components/ui";
import { useStore, setState, addXP, dayOf, recordWord, getState } from "../lib/store";
import { play, speak, confetti } from "../lib/fx";
import { shuffle, conjQuestion } from "../lib/questions";
import { check } from "../lib/answer";
import { displayDe } from "../lib/words";

const DURATION = 60;

function useTimer(running, onEnd, seconds = DURATION) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    let penalty = 0;
    timerApi.penalize = (s) => (penalty += s);
    const id = setInterval(() => {
      const l = Math.max(0, seconds - (Date.now() - started) / 1000 - penalty);
      setLeft(l);
      if (l <= 5 && l > 0 && Math.abs(l - Math.round(l)) < 0.06) play("tick");
      if (l <= 0) {
        clearInterval(id);
        endRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);
  return left;
}
const timerApi = { penalize: () => {} };

function finishGame(name, score, xp) {
  const prevBest = getState().games[name];
  setState((s) => {
    addXP(s, xp);
    dayOf(s).games++;
    s.games[name] = Math.max(s.games[name], score);
  });
  play("finish");
  if (score > prevBest && score > 0) confetti();
  return score > prevBest && score > 0;
}

function Shell({ title, emoji, rules, best, phase, onStart, children, result, extra }) {
  const { close } = useApp();
  if (phase === "intro")
    return (
      <div className="game">
        <div className="game-top">
          <button className="icon-btn" onClick={close} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="game-intro">
          <div className="big-emoji pop">{emoji}</div>
          <h1>{title}</h1>
          <p className="muted">{rules}</p>
          {extra}
          <div className="game-best-big">Personal best: {best}</div>
          <Button size="lg" block onClick={onStart}>
            Start
          </Button>
        </div>
      </div>
    );
  if (phase === "end")
    return (
      <div className="game">
        <div className="game-intro">
          <div className="big-emoji pop">{result.record ? "🏆" : "⏱️"}</div>
          <h1>{result.record ? "New record!" : "Time's up!"}</h1>
          <div className="summary-stats">
            <div className="stat-tile blue">
              <span>Score</span>
              <b>{result.score}</b>
            </div>
            <div className="stat-tile gold">
              <span>XP</span>
              <b>+{result.xp}</b>
            </div>
          </div>
          {result.misses?.length > 0 && (
            <div className="mistakes">
              <h3>Missed</h3>
              {result.misses.slice(0, 6).map((m, i) => (
                <div key={i} className="mistake">
                  <div className="mistake-prompt">{m.prompt}</div>
                  <div className="mistake-correct">{m.answer}</div>
                </div>
              ))}
            </div>
          )}
          <div className="row">
            <Button variant="secondary" size="lg" onClick={close}>
              Done
            </Button>
            <Button size="lg" onClick={onStart}>
              Play again
            </Button>
          </div>
        </div>
      </div>
    );
  return <div className="game">{children}</div>;
}

function TimerBar({ left, score, label }) {
  const { close } = useApp();
  return (
    <div className="game-top">
      <button className="icon-btn" onClick={close} aria-label="Quit">
        <Icon name="x" />
      </button>
      <div className="session-progress">
        <Bar value={left / DURATION} color={left < 10 ? "var(--bad)" : "var(--gold)"} />
      </div>
      <div className="game-score">
        <small>{label}</small>
        <b>{score}</b>
      </div>
    </div>
  );
}

// ── Artikel-Blitz ───────────────────────────────────────────────────────
export function Blitz() {
  const { words } = useApp();
  const s = useStore();
  const nouns = useMemo(() => {
    const all = [...new Map(words.filter((w) => w.type === "noun" && w.art && !w.plOnly && !/isch$/.test(w.de)).map((w) => [w.key, w])).values()];
    const known = all.filter((w) => s.words[w.key]);
    return known.length >= 30 ? [...known, ...shuffle(all).slice(0, 20)] : all.filter((w) => w.level === "A1" || s.words[w.key]);
  }, [words]);
  const [phase, setPhase] = useState("intro");
  const [deck, setDeck] = useState([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState(null);
  const misses = useRef([]);
  const [result, setResult] = useState(null);

  const left = useTimer(phase === "play", () => {
    const xp = score * 2;
    const record = finishGame("blitz", score, xp);
    setResult({ score, xp, record, misses: misses.current });
    setPhase("end");
  });

  function start() {
    setDeck(shuffle(nouns));
    setI(0);
    setScore(0);
    setCombo(0);
    misses.current = [];
    setFlash(null);
    setPhase("play");
  }
  const w = deck[i];
  function answer(a) {
    if (!w || flash) return;
    const ok = a === w.art;
    setState((st) => recordWord(st, w.key, ok, { soft: true }));
    if (ok) {
      play(combo + 1 >= 5 && (combo + 1) % 5 === 0 ? "combo" : "correct");
      setScore((x) => x + 1 + (combo >= 9 ? 1 : 0));
      setCombo((c) => c + 1);
      setFlash({ ok: true, a });
      setTimeout(() => (setFlash(null), setI((x) => x + 1)), 180);
    } else {
      play("wrong");
      timerApi.penalize(3);
      setCombo(0);
      misses.current.push({ prompt: w.de, answer: `${w.art} ${w.de}` });
      setFlash({ ok: false, a });
      setTimeout(() => (setFlash(null), setI((x) => x + 1)), 900);
    }
  }
  useEffect(() => {
    const k = (e) => {
      const map = { 1: "der", 2: "die", 3: "das", ArrowLeft: "der", ArrowDown: "die", ArrowRight: "das" };
      if (phase === "play" && map[e.key]) answer(map[e.key]);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  return (
    <Shell title="Artikel-Blitz" emoji="🌩️" rules="A noun appears — hit der, die or das. Right answers score, wrong ones cost 3 seconds. 10 in a row doubles your points." best={s.games.blitz} phase={phase} onStart={start} result={result}>
      <TimerBar left={left} score={score} label="score" />
      <div className="blitz">
        <div className={`combo-big ${combo >= 3 ? "on" : ""}`}>{combo >= 3 ? `🔥 ${combo}× combo` : " "}</div>
        {w && (
          <div className={`blitz-card ${flash ? (flash.ok ? "ok g-" + w.art : "bad") : ""}`} key={i}>
            <div className="blitz-word">
              {flash && !flash.ok ? <span className={`art art-${w.art}`}>{w.art}</span> : null} {w.de}
            </div>
            <div className="muted">{w.en}</div>
          </div>
        )}
        <div className="article-row big">
          {["der", "die", "das"].map((a, n) => (
            <button key={a} className={`art-btn art-btn-${a}`} onClick={() => answer(a)}>
              <kbd>{n + 1}</kbd>
              {a}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ── Wort-Paare ──────────────────────────────────────────────────────────
export function Match() {
  const { words } = useApp();
  const s = useStore();
  const pool = useMemo(() => {
    const uniq = [...new Map(words.map((w) => [w.de.toLowerCase(), w])).values()].filter((w) => w.en.length < 28);
    const known = uniq.filter((w) => s.words[w.key]);
    return known.length >= 20 ? known : uniq.filter((w) => w.level === "A1");
  }, [words]);
  const [phase, setPhase] = useState("intro");
  const [left, setLeftCol] = useState([]);
  const [right, setRightCol] = useState([]);
  const [selL, setSelL] = useState(null);
  const [selR, setSelR] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wrong, setWrong] = useState(null);
  const bag = useRef([]);
  const [result, setResult] = useState(null);

  const timeLeft = useTimer(phase === "play", () => {
    const xp = Math.round(score / 40);
    const record = finishGame("match", score, xp);
    setResult({ score, xp, record });
    setPhase("end");
  });

  const draw = () => {
    if (!bag.current.length) bag.current = shuffle(pool);
    return bag.current.pop();
  };
  function start() {
    bag.current = shuffle(pool);
    const first = [];
    while (first.length < 5) {
      const w = draw();
      if (!first.some((x) => x.en === w.en)) first.push(w);
    }
    setLeftCol(shuffle(first).map((w) => ({ w, id: Math.random() })));
    setRightCol(shuffle(first).map((w) => ({ w, id: Math.random() })));
    setScore(0);
    setCombo(0);
    setSelL(null);
    setSelR(null);
    setPhase("play");
  }
  useEffect(() => {
    if (selL == null || selR == null) return;
    const L = left[selL], R = right[selR];
    if (L.w.key === R.w.key && L.w.en === R.w.en) {
      play("correct");
      setScore((x) => x + 100 + combo * 20);
      setCombo((c) => c + 1);
      setState((st) => recordWord(st, L.w.key, true, { soft: true }));
      // replace both with a new pair
      let nw;
      do nw = draw();
      while (left.some((x) => x.w.en === nw.en || x.w.de === nw.de));
      const nl = [...left], nr = [...right];
      nl[selL] = { w: nw, id: Math.random(), fresh: true };
      const rSlot = Math.random() < 0.5 ? selR : (selR + 1 + ((Math.random() * 4) | 0)) % 5;
      if (rSlot !== selR) {
        nr[selR] = nr[rSlot];
      }
      nr[rSlot] = { w: nw, id: Math.random(), fresh: true };
      setLeftCol(nl);
      setRightCol(nr);
      setSelL(null);
      setSelR(null);
    } else {
      play("wrong");
      setCombo(0);
      setScore((x) => Math.max(0, x - 30));
      setWrong({ l: selL, r: selR });
      setTimeout(() => {
        setWrong(null);
        setSelL(null);
        setSelR(null);
      }, 450);
    }
  }, [selL, selR]);

  return (
    <Shell title="Wort-Paare" emoji="🧩" rules="Tap a German word, then its English match. Pairs refill instantly. Chain matches for bonus points; wrong taps cost 30." best={s.games.match} phase={phase} onStart={start} result={result}>
      <TimerBar left={timeLeft} score={score} label="score" />
      <div className={`combo-big ${combo >= 3 ? "on" : ""}`}>{combo >= 3 ? `🔥 ${combo}× chain` : " "}</div>
      <div className="match-grid">
        <div className="match-col">
          {left.map((x, idx) => (
            <button
              key={x.id}
              className={`match-tile de ${selL === idx ? "sel" : ""} ${wrong?.l === idx ? "bad" : ""} ${x.fresh ? "fresh" : ""}`}
              onClick={() => {
                if (wrong) return;
                play("tap");
                speak(displayDe(x.w));
                setSelL(idx);
              }}
            >
              {displayDe(x.w)}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((x, idx) => (
            <button
              key={x.id}
              className={`match-tile ${selR === idx ? "sel" : ""} ${wrong?.r === idx ? "bad" : ""} ${x.fresh ? "fresh" : ""}`}
              onClick={() => {
                if (wrong) return;
                play("tap");
                setSelR(idx);
              }}
            >
              {x.w.en}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ── Verb-Gym ────────────────────────────────────────────────────────────
const TENSES = [
  ["pres", "Präsens"],
  ["perf", "Perfekt"],
  ["prat", "Präteritum"],
];

export function VerbGym() {
  const s = useStore();
  const [phase, setPhase] = useState("intro");
  const [tenses, setTenses] = useState(["pres"]);
  const [q, setQ] = useState(null);
  const [text, setText] = useState("");
  const [score, setScore] = useState(0);
  const [fb, setFb] = useState(null);
  const misses = useRef([]);
  const ref = useRef(null);
  const [result, setResult] = useState(null);

  const left = useTimer(phase === "play", () => {
    const xp = score * 3;
    const record = finishGame("gym", score, xp);
    setResult({ score, xp, record, misses: misses.current });
    setPhase("end");
  });

  function start() {
    setScore(0);
    misses.current = [];
    setQ(conjQuestion(tenses));
    setText("");
    setFb(null);
    setPhase("play");
    setTimeout(() => ref.current?.focus(), 50);
  }
  function submit(e) {
    e.preventDefault();
    if (fb || !text.trim()) return;
    const r = check(text, q.answer, { typos: false });
    if (r.ok) {
      play("correct");
      setScore((x) => x + 1);
      setFb({ ok: true });
      setTimeout(nextQ, 250);
    } else {
      play("wrong");
      misses.current.push({ prompt: `${q.prompt.replace("___", "…")} (${q.verb}, ${q.label.split(" · ")[0]})`, answer: q.speakText });
      setFb({ ok: false });
      setTimeout(nextQ, 1400);
    }
  }
  function nextQ() {
    setQ(conjQuestion(tenses));
    setText("");
    setFb(null);
    setTimeout(() => ref.current?.focus(), 20);
  }

  const picker = (
    <div className="chips center">
      {TENSES.map(([id, l]) => (
        <button key={id} className={`chip-toggle ${tenses.includes(id) ? "on" : ""}`} onClick={() => setTenses(tenses.includes(id) ? (tenses.length > 1 ? tenses.filter((t) => t !== id) : tenses) : [...tenses, id])}>
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <Shell title="Verb-Gym" emoji="🏋️" rules="Conjugate as many verbs as you can in 60 seconds. Pick the tenses you want to train." best={s.games.gym} phase={phase} onStart={start} result={result} extra={picker}>
      <TimerBar left={left} score={score} label="reps" />
      {q && (
        <form className="gym" onSubmit={submit}>
          <div className="q-label">{q.label}</div>
          <div className="gym-verb">{q.verb}</div>
          <div className={`gym-prompt ${fb ? (fb.ok ? "ok" : "bad") : ""}`}>
            {q.prompt.replace(" ___", "")} <span className="gap">{fb && !fb.ok ? q.answer : fb?.ok ? text : " "}</span>
          </div>
          <input ref={ref} className="answer-input" value={text} onChange={(e) => setText(e.target.value)} placeholder={q.tense === "perf" ? "z. B. hat gemacht" : "Form…"} autoComplete="off" autoCapitalize="off" spellCheck="false" lang="de" disabled={!!fb} />
          <UmlautBar inputRef={ref} onInsert={setText} />
          <Button type="submit" size="lg" block disabled={!text.trim() || !!fb}>
            Check
          </Button>
        </form>
      )}
    </Shell>
  );
}
