"use client";

const MUTE_KEY = "starmap.voice.muted";

export function isVoiceMuted(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(MUTE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function setVoiceMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {}
  if (muted) stopSpeech();
}

export function stopSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {}
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /samantha/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en") && v.default) ??
    null
  );
}

export function speak(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (isVoiceMuted()) return;
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.pitch = 1.12;
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  } catch {}
}
