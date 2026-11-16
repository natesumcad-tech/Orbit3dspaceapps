"use client";

const MUTE_KEY = "starmap.voice.muted";
let currentAudio: HTMLAudioElement | null = null;

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
  if (typeof window === "undefined") return;
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = /samantha|aria|jenny|ava|zira|victoria|karen|moira|susan|hazel|female|google us english|google uk english female/i;
  return (
    voices.find((v) => v.lang.startsWith("en") && preferred.test(v.name)) ??
    voices.find((v) => preferred.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en") && v.default) ??
    null
  );
}

export function playAudio(src: string, fallbackText?: string): void {
  if (typeof window === "undefined") return;
  if (isVoiceMuted()) return;
  stopSpeech();
  try {
    const audio = new Audio(src);
    currentAudio = audio;
    audio.onerror = () => {
      if (currentAudio === audio) currentAudio = null;
      if (fallbackText) speak(fallbackText);
    };
    audio.play().catch(() => {
      if (currentAudio === audio) currentAudio = null;
      if (fallbackText) speak(fallbackText);
    });
  } catch {
    if (fallbackText) speak(fallbackText);
  }
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
    u.pitch = 1.15;
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  } catch {}
}
