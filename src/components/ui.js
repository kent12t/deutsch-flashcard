import React from "react";
import { speak, play } from "../lib/fx";

const PATHS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  practice: "M6 4v16M18 4v16M3 8v8M21 8v8M6 12h12",
  grammar: "M4 19.5V5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zm0 0A2 2 0 0 0 6 22h13v-4M9 7h6M9 11h4",
  words: "M4 6h16M4 12h16M4 18h10",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0",
  volume: "M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13",
  x: "M18 6 6 18M6 6l12 12",
  back: "M15 18l-6-6 6-6",
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm10 3-5-5",
  check: "M5 12l5 5L20 7",
  play: "M7 4v16l13-8z",
  trash: "M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3",
  chevron: "M9 6l6 6-6 6",
  lock: "M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4",
};

export function Icon({ name, size = 22, stroke = 2, className, style }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Button({ variant = "primary", size, block, className = "", children, ...rest }) {
  return (
    <button className={`btn btn-${variant} ${size ? "btn-" + size : ""} ${block ? "btn-block" : ""} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Speaker({ text, size = 20, className = "" }) {
  return (
    <button
      type="button"
      className={`speaker ${className}`}
      aria-label={`Listen: ${text}`}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
    >
      <Icon name="volume" size={size} />
    </button>
  );
}

export function Ring({ value, size = 56, stroke = 6, color = "var(--gold)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset .6s ease" }} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}

export function Bar({ value, color, thin }) {
  return (
    <div className={`bar ${thin ? "bar-thin" : ""}`}>
      <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
    </div>
  );
}

/** Render **bold** markup safely. */
export function Rich({ text }) {
  if (!text) return null;
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : <React.Fragment key={i}>{p}</React.Fragment>));
}

export function ArticleTag({ art }) {
  if (!art) return null;
  return <span className={`art art-${art}`}>{art}</span>;
}

export function Header({ title, onBack, right }) {
  return (
    <header className="subheader">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <Icon name="back" />
        </button>
      )}
      <h1>{title}</h1>
      <div className="subheader-right">{right}</div>
    </header>
  );
}

export function Sheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const tap = () => play("tap");

export const UMLAUTS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"];

export function UmlautBar({ inputRef, onInsert }) {
  return (
    <div className="umlauts">
      {UMLAUTS.map((ch) => (
        <button
          key={ch}
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const el = inputRef.current;
            if (!el) return;
            const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? el.value.length;
            const next = el.value.slice(0, s) + ch + el.value.slice(e);
            onInsert(next);
            requestAnimationFrame(() => {
              el.focus();
              el.setSelectionRange(s + 1, s + 1);
            });
          }}
        >
          {ch}
        </button>
      ))}
    </div>
  );
}
