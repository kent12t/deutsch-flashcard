import React, { useRef } from "react";
import { Button, Ring } from "../components/ui";
import { useStore, setState, levelInfo, liveStreak, today, ACHIEVEMENTS, stats, resetAll, importState, getState } from "../lib/store";
import { canSpeak, speak } from "../lib/fx";

function Heatmap({ days, goal }) {
  const cells = [];
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 7 * 15 - end.getDay());
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const k = today(d);
    const xp = days[k]?.xp || 0;
    const lvl = xp === 0 ? 0 : xp < goal / 2 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4;
    cells.push(<i key={k} className={`hm-${lvl}`} title={`${k}: ${xp} XP`} />);
  }
  return <div className="heatmap" aria-label="Activity over the last 16 weeks">{cells}</div>;
}

export default function Profile() {
  const s = useStore();
  const lv = levelInfo(s.xp);
  const fileRef = useRef(null);
  const setSetting = (k, v) => setState((st) => (st.settings[k] = v));
  const acc = s.stats.answered ? Math.round((s.stats.correct / s.stats.answered) * 100) : 0;

  function exportData() {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `deutsch-progress-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importData(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => {
      try {
        importState(t);
        alert("Progress restored!");
      } catch (err) {
        alert(err.message);
      }
    });
  }

  return (
    <div className="page">
      <section className="card profile-hero">
        <Ring value={lv.pct} size={96} stroke={8} color="var(--gold)">
          <img src="./assets/kent.png" alt="" className="avatar" />
        </Ring>
        <div>
          <div className="eyebrow">Level {lv.level}</div>
          <h1>{lv.title}</h1>
          <div className="muted small">
            {lv.into} / {lv.span} XP to level {lv.level + 1}
          </div>
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-tile orange">
          <span>Streak</span>
          <b>🔥 {liveStreak(s)}</b>
          <small>best {s.streak.best} · 🧊×{s.streak.freezes}</small>
        </div>
        <div className="stat-tile gold">
          <span>Total XP</span>
          <b>{s.xp}</b>
        </div>
        <div className="stat-tile blue">
          <span>Words learned</span>
          <b>{stats.learnedCount(s)}</b>
          <small>{stats.masteredCount(s)} mastered</small>
        </div>
        <div className="stat-tile green">
          <span>Accuracy</span>
          <b>{acc}%</b>
          <small>{s.stats.answered} answers</small>
        </div>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>Activity</h2>
          <span className="muted small">last 16 weeks</span>
        </div>
        <Heatmap days={s.days} goal={s.goal} />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Achievements</h2>
          <span className="muted small">
            {Object.keys(s.achievements).length}/{ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="ach-grid">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className={`ach ${s.achievements[a.id] ? "got" : ""}`} title={a.desc}>
              <span className="ach-icon">{a.icon}</span>
              <b>{a.name}</b>
              <small>{a.desc}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="card settings">
        <h2>Settings</h2>
        <div className="setting">
          <span>Daily goal</span>
          <div className="seg">
            {[20, 50, 100, 200].map((g) => (
              <button key={g} className={s.goal === g ? "on" : ""} onClick={() => setState((st) => (st.goal = g))}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="setting">
          <span>Theme</span>
          <div className="seg">
            {[
              ["system", "Auto"],
              ["light", "Light"],
              ["dark", "Dark"],
            ].map(([v, l]) => (
              <button key={v} className={s.settings.theme === v ? "on" : ""} onClick={() => setSetting("theme", v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <label className="setting">
          <span>Sound effects</span>
          <input type="checkbox" className="switch" checked={s.settings.sound} onChange={(e) => setSetting("sound", e.target.checked)} />
        </label>
        <label className="setting">
          <span>Auto-play pronunciation</span>
          <input type="checkbox" className="switch" checked={s.settings.autoSpeak} onChange={(e) => setSetting("autoSpeak", e.target.checked)} />
        </label>
        {canSpeak() && (
          <div className="setting">
            <span>Speech speed</span>
            <div className="seg">
              {[
                [0.7, "Slow"],
                [0.9, "Normal"],
                [1.05, "Fast"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  className={s.settings.rate === v ? "on" : ""}
                  onClick={() => {
                    setSetting("rate", v);
                    speak("Guten Tag!", v);
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="setting">
          <span>Backup</span>
          <div className="row">
            <Button variant="secondary" size="sm" onClick={exportData}>
              Export
            </Button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              Import
            </Button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          </div>
        </div>
        <div className="setting">
          <span>Reset all progress</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Delete all progress, XP and streaks? This cannot be undone.")) resetAll();
            }}
          >
            Reset
          </Button>
        </div>
        <p className="muted small">Progress is saved on this device. Use Export to move it to another one.</p>
      </section>

      <footer className="credit">
        <img src="./assets/kent.png" alt="" />
        <span>Created by Kent · Viel Erfolg!</span>
      </footer>
    </div>
  );
}
