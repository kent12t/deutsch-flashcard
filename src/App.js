import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Icon, Ring } from "./components/ui";
import { useStore, onEvent, levelInfo, liveStreak, today } from "./lib/store";
import { buildWords } from "./lib/words";
import { play, confetti } from "./lib/fx";
import Home from "./screens/Home";
import Practice from "./screens/Practice";
import Grammar, { LessonView } from "./screens/Grammar";
import Words from "./screens/Words";
import Profile from "./screens/Profile";
import Session from "./screens/Session";
import { Blitz, Match, VerbGym } from "./screens/Games";

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

const TABS = [
  { id: "home", label: "Lernen", icon: "home" },
  { id: "practice", label: "Üben", icon: "practice" },
  { id: "grammar", label: "Grammatik", icon: "grammar" },
  { id: "words", label: "Wörter", icon: "words" },
  { id: "profile", label: "Ich", icon: "user" },
];

export default function App() {
  const [tab, setTab] = useState(() => (location.hash.slice(1) && TABS.some((t) => t.id === location.hash.slice(1)) ? location.hash.slice(1) : "home"));
  const [overlay, setOverlay] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [levelUp, setLevelUp] = useState(null);
  const custom = useStore((s) => s.custom);
  const theme = useStore((s) => s.settings.theme);
  const words = useMemo(() => buildWords(custom), [custom]);

  useEffect(() => {
    if (theme === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    history.replaceState(null, "", `#${tab}`);
    window.scrollTo(0, 0);
  }, [tab]);

  useEffect(
    () =>
      onEvent((e) => {
        if (e.type === "levelup") {
          setLevelUp(e);
          play("levelup");
          confetti(180);
          return;
        }
        const t =
          e.type === "achievement"
            ? { icon: e.ach.icon, title: "Achievement unlocked", text: e.ach.name }
            : e.type === "goal"
              ? { icon: "🎯", title: "Daily goal reached!", text: "Tagesziel erreicht — keep the streak alive tomorrow." }
              : { icon: e.icon, text: e.text };
        if (e.type === "goal") confetti(80);
        const id = Math.random();
        setToasts((ts) => [...ts, { ...t, id }]);
        setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3800);
      }),
    []
  );

  const ctx = useMemo(
    () => ({
      words,
      tab,
      setTab,
      startSession: (cfg) => setOverlay({ type: "session", key: Date.now(), ...cfg }),
      openLesson: (id) => setOverlay({ type: "lesson", id }),
      openGame: (name) => setOverlay({ type: "game", name }),
      close: () => setOverlay(null),
    }),
    [words, tab]
  );

  let overlayEl = null;
  if (overlay?.type === "session")
    overlayEl = <Session {...overlay} key={overlay.key} onExit={() => setOverlay(overlay.back || null)} />;
  else if (overlay?.type === "lesson") overlayEl = <LessonView id={overlay.id} />;
  else if (overlay?.type === "game") {
    const G = { blitz: Blitz, match: Match, gym: VerbGym }[overlay.name];
    overlayEl = <G />;
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app">
        {overlayEl ? (
          <div className="overlay">{overlayEl}</div>
        ) : (
          <>
            <TopBar />
            <main className="main">
              {tab === "home" && <Home />}
              {tab === "practice" && <Practice />}
              {tab === "grammar" && <Grammar />}
              {tab === "words" && <Words />}
              {tab === "profile" && <Profile />}
            </main>
            <nav className="tabbar" aria-label="Main">
              {TABS.map((t) => (
                <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}>
                  <Icon name={t.icon} size={22} />
                  <span>{t.label}</span>
                </button>
              ))}
            </nav>
          </>
        )}
        <div className="toasts" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="toast">
              <span className="toast-icon">{t.icon}</span>
              <div>
                {t.title && <div className="toast-title">{t.title}</div>}
                <div className="toast-text">{t.text}</div>
              </div>
            </div>
          ))}
        </div>
        {levelUp && (
          <div className="levelup-backdrop" onClick={() => setLevelUp(null)}>
            <div className="levelup">
              <div className="levelup-badge">{levelUp.level}</div>
              <h2>Level up!</h2>
              <p>
                You are now a <b>{levelUp.title}</b>.
              </p>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => setLevelUp(null)}>
                Weiter so!
              </button>
            </div>
          </div>
        )}
      </div>
    </AppCtx.Provider>
  );
}

function TopBar() {
  const s = useStore();
  const { setTab } = useApp();
  const lv = levelInfo(s.xp);
  const streak = liveStreak(s);
  const todayXp = s.days[today()]?.xp || 0;
  const doneToday = s.streak.last === today();
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setTab("home")} aria-label="Home">
        <span className="brand-flag" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="brand-name">Deutsch</span>
      </button>
      <div className="topbar-stats">
        <button className={`pill streak ${doneToday ? "lit" : ""}`} onClick={() => setTab("profile")} title={`${streak}-day streak`}>
          🔥 <b>{streak}</b>
        </button>
        <button className="pill" onClick={() => setTab("profile")} title={`Level ${lv.level} · ${s.xp} XP`}>
          <span className="lvl">{lv.level}</span>
          <b>{s.xp}</b>
          <small>XP</small>
        </button>
        <button className="goal-mini" onClick={() => setTab("home")} title={`Daily goal ${todayXp}/${s.goal} XP`}>
          <Ring value={todayXp / s.goal} size={34} stroke={4} color={todayXp >= s.goal ? "var(--ok)" : "var(--gold)"}>
            <span style={{ fontSize: 12 }}>{todayXp >= s.goal ? "✓" : "🎯"}</span>
          </Ring>
        </button>
      </div>
    </header>
  );
}
