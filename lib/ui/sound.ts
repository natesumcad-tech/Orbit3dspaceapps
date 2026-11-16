"use client";

/**
 * Little sound effects, made on the spot with the Web Audio API (no audio files to download):
 * clicks for buttons, a ratchet for the settings wrench, wooshes for movement and beeps for the
 * mission. Quiet by design, and switchable off (remembered in this browser).
 */

const STORE = "ui.sound";
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let on = true;
try {
  on = typeof localStorage === "undefined" || localStorage.getItem(STORE) !== "off";
} catch {}
const listeners = new Set<(on: boolean) => void>();

export const soundOn = () => on;
export function setSoundOn(v: boolean) {
  on = v;
  try {
    localStorage.setItem(STORE, v ? "on" : "off");
  } catch {}
  listeners.forEach((f) => f(v));
  if (v) sfx.click();
}
export function onSoundChange(f: (on: boolean) => void) {
  listeners.add(f);
  return () => void listeners.delete(f);
}

/** The audio context, created on first use (browsers only allow sound after a click or key). */
function audio() {
  if (!on || typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = 0.5;
      out.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx.state === "closed" ? null : ctx;
  } catch {
    return null;
  }
}

let noiseBuf: AudioBuffer | null = null;
function noise(a: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = a.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

/** A short tone with a quick attack and an exponential fade. */
function tone(freq: number, at: number, dur: number, vol: number, type: OscillatorType = "sine", toFreq?: number) {
  const a = audio();
  if (!a || !out) return;
  const t0 = a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (toFreq) o.frequency.exponentialRampToValueAtTime(toFreq, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(out);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

/** A burst of filtered noise (ticks, wooshes). */
function hiss(at: number, dur: number, vol: number, f0: number, f1: number, q = 0.8) {
  const a = audio();
  if (!a || !out) return;
  const t0 = a.currentTime + at;
  const s = noise(a), f = a.createBiquadFilter(), g = a.createGain();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t0);
  f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.25, dur * 0.4));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f).connect(g).connect(out);
  s.start(t0, Math.random());
  s.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** A soft button click. */
  click: () => {
    hiss(0, 0.035, 0.22, 3200, 2600, 2.5);
    tone(1800, 0, 0.03, 0.04, "triangle");
  },
  /** The settings wrench: a little ratchet. */
  wrench: () => {
    for (let k = 0; k < 4; k++) hiss(k * 0.055, 0.03, 0.3 - k * 0.04, 2400 - k * 150, 1900, 3);
    tone(420, 0.2, 0.06, 0.05, "square");
  },
  /** Moving through space; `power` 0–1 sets how big. */
  woosh: (power = 0.6) => {
    const p = Math.max(0.15, Math.min(1, power));
    hiss(0, 0.45 + p * 0.35, 0.18 + p * 0.3, 260, 1500 + p * 1500, 0.7);
  },
  /** Stepping into (or out of) a 360° view, or out to the galaxy. */
  swoop: (up = true) => {
    hiss(0, 0.9, 0.42, up ? 180 : 2600, up ? 2600 : 180, 0.6);
    tone(up ? 220 : 440, 0, 0.8, 0.05, "sine", up ? 440 : 220);
  },
  /** Mission: an incoming transmission. */
  incoming: () => {
    tone(1180, 0, 0.09, 0.11, "square");
    tone(1180, 0.14, 0.09, 0.11, "square");
    tone(1580, 0.28, 0.16, 0.1, "square");
  },
  /** Mission: objective complete. */
  done: () => {
    tone(880, 0, 0.12, 0.14, "triangle");
    tone(1320, 0.1, 0.22, 0.14, "triangle");
  },
  /** Mission: not quite (a wrong answer or a wrong turn). */
  nope: () => {
    tone(330, 0, 0.13, 0.12, "square");
    tone(262, 0.15, 0.2, 0.12, "square");
  },
  /** Mission complete. */
  fanfare: () => [523, 659, 784, 1047].forEach((f, k) => tone(f, k * 0.11, k === 3 ? 0.5 : 0.16, 0.13, "triangle")),
  /** Tour step done. */
  chime: () => {
    tone(1047, 0, 0.18, 0.08, "sine");
    tone(1568, 0.07, 0.3, 0.07, "sine");
  },
};
