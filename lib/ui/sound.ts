"use client";

/**
 * Little sound effects, mostly made on the spot with the Web Audio API: a recorded click for buttons
 * (public/sounds/click.mp3), a ratchet for the settings wrench, wooshes for movement and beeps for the
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
      loadSamples(ctx);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx.state === "closed" ? null : ctx;
  } catch {
    return null;
  }
}

/** Recorded sounds, decoded once the audio starts. */
const samples: Record<string, AudioBuffer | undefined> = {};
const SAMPLE_URLS = { click: "/sounds/click.mp3" };
function loadSamples(a: AudioContext) {
  for (const [name, url] of Object.entries(SAMPLE_URLS))
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => a.decodeAudioData(b))
      .then((buf) => (samples[name] = buf))
      .catch(() => {});
}
function play(name: keyof typeof SAMPLE_URLS, vol = 0.8) {
  const a = audio(), buf = samples[name];
  if (!a || !out || !buf) return false;
  const s = a.createBufferSource(), g = a.createGain();
  s.buffer = buf;
  g.gain.value = vol;
  s.connect(g).connect(out);
  s.start();
  return true;
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

/** A random number between a and b (each woosh comes out a little different). */
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Moving air: noise through a sweeping filter, with optional left/right travel and a wobble (for
 * spins). The building block for every woosh.
 */
function air(o: { dur: number; vol: number; f0: number; f1: number; q?: number; pan0?: number; pan1?: number; wobble?: number; low?: boolean }) {
  const a = audio();
  if (!a || !out) return;
  const t0 = a.currentTime;
  const s = noise(a), f = a.createBiquadFilter(), g = a.createGain();
  f.type = o.low ? "lowpass" : "bandpass";
  f.Q.value = o.q ?? 0.8;
  f.frequency.setValueAtTime(o.f0, t0);
  f.frequency.exponentialRampToValueAtTime(o.f1, t0 + o.dur * 0.85);
  // swells in, then trails off
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.vol, t0 + o.dur * rnd(0.25, 0.45));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  let node: AudioNode = s.connect(f).connect(g);
  if (o.wobble) {
    // a spinning flutter: the filter swings back and forth a few times
    const lfo = a.createOscillator(), depth = a.createGain();
    lfo.frequency.value = o.wobble;
    depth.gain.value = Math.min(o.f0, o.f1) * 0.6;
    lfo.connect(depth).connect(f.frequency);
    lfo.start(t0);
    lfo.stop(t0 + o.dur + 0.05);
  }
  if (a.createStereoPanner && (o.pan0 || o.pan1)) {
    const p = a.createStereoPanner();
    p.pan.setValueAtTime(o.pan0 ?? 0, t0);
    p.pan.linearRampToValueAtTime(o.pan1 ?? 0, t0 + o.dur);
    node = node.connect(p);
  }
  node.connect(out);
  s.start(t0, Math.random());
  s.stop(t0 + o.dur + 0.05);
}

export const sfx = {
  /** A button click: the recorded one, or a synthesized tick until it has loaded. */
  click: () => {
    if (play("click")) return;
    hiss(0, 0.035, 0.22, 3200, 2600, 2.5);
    tone(1800, 0, 0.03, 0.04, "triangle");
  },
  /** The settings wrench: a little ratchet. */
  wrench: () => {
    for (let k = 0; k < 4; k++) hiss(k * 0.055, 0.03, 0.3 - k * 0.04, 2400 - k * 150, 1900, 3);
    tone(420, 0.2, 0.06, 0.05, "square");
  },
  /** Panning across the sky: air rushing past from one side to the other. `dir` −1 left … 1 right. */
  pan: (power = 0.6, dir = 0) => {
    const p = Math.max(0.15, Math.min(1, power)), d = Math.max(-1, Math.min(1, dir));
    const shape = Math.floor(Math.random() * 3);
    if (shape === 0) air({ dur: rnd(0.5, 0.7) + p * 0.3, vol: 0.16 + p * 0.28, f0: rnd(300, 450), f1: rnd(1600, 2600) + p * 1200, q: rnd(0.6, 1), pan0: -d * 0.7, pan1: d * 0.8 });
    else if (shape === 1) air({ dur: rnd(0.45, 0.6) + p * 0.25, vol: 0.14 + p * 0.26, f0: rnd(1800, 2600), f1: rnd(500, 800), q: rnd(0.8, 1.4), pan0: -d * 0.5, pan1: d });
    else air({ dur: rnd(0.6, 0.8) + p * 0.3, vol: 0.18 + p * 0.25, f0: rnd(500, 700), f1: rnd(900, 1400), low: true, pan0: -d * 0.8, pan1: d * 0.6 });
  },
  /** Zooming in or out, big or tiny: the same rush, just louder and longer for a bigger zoom. */
  zoom: (power = 0.5) => {
    const p = Math.max(0.08, Math.min(1, power));
    air({ dur: 0.22 + p * 0.55, vol: 0.08 + p * 0.34, f0: 420 * rnd(0.9, 1.1), f1: (1400 + p * 2200) * rnd(0.9, 1.1), q: 0.9 });
  },
  /** Turning or tilting the view: a whirling flutter. */
  spin: (power = 0.5, dir = 1) => {
    const p = Math.max(0.15, Math.min(1, power));
    air({ dur: rnd(0.55, 0.75) + p * 0.3, vol: 0.14 + p * 0.22, f0: rnd(700, 1000), f1: rnd(1300, 1900), q: rnd(1.2, 2), wobble: rnd(5, 9), pan0: -0.6 * dir, pan1: 0.6 * dir });
  },
  /** Flying to a place: a deep, long rush that rises as you arrive. */
  travel: () => {
    air({ dur: rnd(1.3, 1.6), vol: 0.42, f0: rnd(90, 130), f1: rnd(900, 1300), low: true });
    air({ dur: rnd(1.1, 1.3), vol: 0.16, f0: rnd(600, 800), f1: rnd(2600, 3400), q: 0.7 });
  },
  /** (kept for older calls) a general woosh */
  woosh: (power = 0.6) => sfx.pan(power, 0),
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
