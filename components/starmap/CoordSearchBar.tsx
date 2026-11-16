"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import {
  BENCHMARK_TARGETS,
  formatDecDMS,
  formatRaHMS,
  parseRaDec,
  type BenchmarkTarget,
} from "@/lib/starmap/coordSearch";

interface CoordSearchBarProps {
  centerRa: number;
  centerDec: number;
  hasMarker: boolean;
  onJump: (ra: number, dec: number, fov?: number, label?: string) => void;
  onClearMarker: () => void;
  onShareLink: () => Promise<void> | void;
}

export default function CoordSearchBar({
  centerRa,
  centerDec,
  hasMarker,
  onJump,
  onClearMarker,
  onShareLink,
}: CoordSearchBarProps) {
  const t = useT();
  const tr = t;
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  // The rescue mission can type coordinates in for you (you still press Go)
  useEffect(() => {
    const fill = (e: Event) => {
      setQuery((e as CustomEvent<string>).detail);
      input.current?.focus({ preventScroll: true });
    };
    window.addEventListener("coord-fill", fill);
    return () => window.removeEventListener("coord-fill", fill);
  }, []);
  const [openPresets, setOpenPresets] = useState(false);
  const [copied, setCopied] = useState(false);
  // Click a coordinate to copy it (to paste into the mission, a notebook, or a message)
  const [copiedPart, setCopiedPart] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copy = (part: string, text: string) => {
    const done = () => {
      setCopiedPart(part);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedPart(null), 1400);
    };
    navigator.clipboard?.writeText(text).then(done, done);
  };

  const trimmed = query.trim();
  const parsed = trimmed ? parseRaDec(trimmed) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed || !parsed.ok) return;
    onJump(parsed.coord.ra, parsed.coord.dec, 1.5);
    window.dispatchEvent(new CustomEvent("coord-jump", { detail: { ra: parsed.coord.ra, dec: parsed.coord.dec } }));
    setOpenPresets(false);
  };

  const selectPreset = (t: BenchmarkTarget) => {
    setQuery(t.coordText);
    setOpenPresets(false);
    onJump(t.ra, t.dec, t.fov, t.name);
  };

  return (
    <div className="mv-coord-search">
      <form className="mv-coord-form" onSubmit={submit}>
        <input
          type="text"
          ref={input}
          className="mv-coord-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpenPresets(true)}
          placeholder={t("RA / Dec (e.g. 17h 57m 48.5s +04° 41' 36\" or 269.452, +4.693)")}
          aria-label={t("Search J2000 RA and Dec coordinates")}
        />
        <button
          type="submit"
          className="mv-coord-btn mv-coord-go"
          disabled={!parsed || !parsed.ok}
        >
          {t("Go")}
        </button>
        <button
          type="button"
          className="mv-coord-btn mv-coord-presets-btn"
          onClick={() => setOpenPresets((v) => !v)}
          aria-expanded={openPresets}
          title={t("SPHEREx benchmark targets")}
        >
          {t("Targets ▾")}
        </button>
        <button
          type="button"
          className="mv-coord-btn"
          onClick={async () => {
            await onShareLink();
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          title={t("Copy shareable URL with RA, Dec, band, and zoom")}
        >
          {copied ? t("Copied!") : t("Share a link")}
        </button>
        {hasMarker && (
          <button
            type="button"
            className="mv-coord-btn"
            onClick={() => {
              onClearMarker();
              setQuery("");
            }}
            title={t("Clear target reticle")}
          >
            ✕
          </button>
        )}
      </form>

      {parsed && !parsed.ok && (
        <div className="mv-coord-feedback error">{t(parsed.error)}</div>
      )}
      {parsed && parsed.ok && (
        <div className="mv-coord-feedback ok">
          J2000: {formatRaHMS(parsed.coord.ra)}, {formatDecDMS(parsed.coord.dec)} ({parsed.coord.ra.toFixed(3)}°, {parsed.coord.dec >= 0 ? "+" : ""}{parsed.coord.dec.toFixed(3)}°)
        </div>
      )}

      <div className="mv-coord-center">
        <span>Center J2000:</span>
        <button type="button" className={`mv-cc mv-cc-ra ${copiedPart === "ra" ? "copied" : ""}`} onClick={() => copy("ra", formatRaHMS(centerRa))} title={`${t("Right ascension (RA): how far east around the sky, in hours")} · ${t("Click to copy")}`}>
          <small>RA</small>
          <code>{formatRaHMS(centerRa)}</code>
          {copiedPart === "ra" && <em className="mv-cc-done">{t("Copied!")}</em>}
        </button>
        <button type="button" className={`mv-cc mv-cc-dec ${copiedPart === "dec" ? "copied" : ""}`} onClick={() => copy("dec", formatDecDMS(centerDec))} title={`${t("Declination (Dec): how far north (+) or south (−), in degrees")} · ${t("Click to copy")}`}>
          <small>Dec</small>
          <code>{formatDecDMS(centerDec)}</code>
          {copiedPart === "dec" && <em className="mv-cc-done">{t("Copied!")}</em>}
        </button>
        <button type="button" className={`mv-coord-dec ${copiedPart === "deg" ? "copied" : ""}`} onClick={() => copy("deg", `${centerRa.toFixed(3)}, ${centerDec >= 0 ? "+" : ""}${centerDec.toFixed(3)}`)} title={t("Click to copy")}>
          ({centerRa.toFixed(3)}°, {centerDec >= 0 ? "+" : ""}{centerDec.toFixed(3)}°){copiedPart === "deg" && <em className="mv-cc-done">{t("Copied!")}</em>}
        </button>
        <span className="mv-cc-hint">{t("(click to copy)")}</span>
      </div>

      {openPresets && (
        <div className="mv-coord-presets">
          <div className="mv-coord-presets-title">{t("SPHEREx Benchmark Targets")}</div>
          <div className="mv-coord-pills">
            {BENCHMARK_TARGETS.map((t) => (
              <button
                key={t.name}
                type="button"
                className="mv-coord-pill"
                onClick={() => selectPreset(t)}
              >
                <span className="mv-coord-pill-name">
                  {t.name} <small className="mv-coord-pill-note">· {tr(t.note)}</small>
                </span>
                <span className="mv-coord-pill-pos">{t.coordText}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
