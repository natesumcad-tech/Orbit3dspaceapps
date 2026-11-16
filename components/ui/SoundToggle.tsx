"use client";

import { useEffect, useState } from "react";
import { onSoundChange, setSoundOn, soundOn } from "@/lib/ui/sound";
import { useT } from "@/lib/i18n";

/** Sound effects on / off (remembered in this browser). */
export default function SoundToggle({ className = "" }: { className?: string }) {
  const t = useT();
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(soundOn());
    return onSoundChange(setOn);
  }, []);
  return (
    <button type="button" className={`sound-toggle ${className}`} aria-pressed={on} onClick={() => setSoundOn(!on)} title={t(on ? "Sound effects on" : "Sound effects off")} aria-label={t("Sound effects")}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        {on ? (
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
