import { getState } from "./store";

// ── Sound effects (synthesised, no assets) ──────────────────────────────
let ctx;
function tone(freq, start, dur, type = "sine", gain = 0.12) {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

const SOUNDS = {
  correct: () => { tone(660, 0, 0.12, "triangle"); tone(990, 0.08, 0.18, "triangle"); },
  combo: () => { tone(660, 0, 0.1, "triangle"); tone(880, 0.07, 0.1, "triangle"); tone(1320, 0.14, 0.2, "triangle"); },
  wrong: () => { tone(200, 0, 0.18, "sawtooth", 0.06); tone(150, 0.1, 0.22, "sawtooth", 0.06); },
  tap: () => tone(520, 0, 0.05, "sine", 0.05),
  tick: () => tone(1200, 0, 0.03, "square", 0.03),
  finish: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, "triangle")),
  levelup: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.07, 0.3, "triangle", 0.1)),
};

export function play(name) {
  if (!getState().settings.sound) return;
  try {
    SOUNDS[name]?.();
  } catch {
    /* audio blocked */
  }
}

// ── Speech ──────────────────────────────────────────────────────────────
let voice = null;
function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  voice = voices.find((v) => v.lang === "de-DE" && /Google|Anna|Petra|Helena|Katja/i.test(v.name)) || voices.find((v) => v.lang?.startsWith("de")) || null;
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}
export const canSpeak = () => typeof window !== "undefined" && !!window.speechSynthesis;

export function speak(text, rate) {
  if (!canSpeak() || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  if (voice) u.voice = voice;
  u.rate = rate ?? getState().settings.rate ?? 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ── Confetti ────────────────────────────────────────────────────────────
export function confetti(count = 120) {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.createElement("canvas");
  c.className = "confetti";
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  document.body.appendChild(c);
  const g = c.getContext("2d");
  g.scale(dpr, dpr);
  const colors = ["#2F6FED", "#E5484D", "#2BA471", "#F5A524", "#8E4EC6", "#1B1A17"];
  const parts = Array.from({ length: count }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    w: 6 + Math.random() * 6,
    h: 4 + Math.random() * 4,
    c: colors[(Math.random() * colors.length) | 0],
  }));
  let frame = 0;
  (function tick() {
    g.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.fillStyle = p.c;
      g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      g.restore();
    }
    if (++frame < 160) requestAnimationFrame(tick);
    else c.remove();
  })();
}
