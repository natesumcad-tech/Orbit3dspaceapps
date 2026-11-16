"use client";

import { useEffect, useRef } from "react";

/**
 * Where the arrow should point, in screen pixels. `top`/`bottom` are the target's edges (the arrow
 * hovers just above it, or below when there's no room). `behind` marks a point projected from behind
 * the camera, whose direction is reversed.
 */
export type ArrowSpot = { x: number; top: number; bottom: number; behind?: boolean; label?: string; /** width of a control to ring (points get a circle) */ w?: number };

const M = 54; // keep the arrow this far inside the screen edges

/** Angles around a target to try, starting straight above it (radians, clockwise). */
const AROUND = [0, -0.52, 0.52, -1.05, 1.05, -1.57, 1.57, -2.09, 2.09, -2.62, 2.62, Math.PI];
/** How far out from the target to look for open space (px past its edge), nearest first. */
const GAPS = Array.from({ length: 15 }, (_, k) => 8 + k * 24);

/** Panels and text boxes the arrow mustn't cover. */
const BLOCKERS =
  ".q-card, .q-mini, .tour-card, .tour-banner, .site-tabs, .mv-glass, .mv-blink-bar, .mv-coord-form, .mv-coord-center, .mv-coord-presets, .mv-search-panel, .mv-wrench, .mv-pop, .mv-ai.open, .mv-addcard.open, .xp-card, .xp-move, .xp-toolbar, .xp-hint, .xp-zoom, .xp-panel.open, .bk-card, .cv-hud, .cv-card";
type Box = { l: number; r: number; t: number; b: number };
let blockCache: { at: number; boxes: Box[] } = { at: -1e9, boxes: [] };
/** Where the panels are (measured a few times a second, not every frame: measuring forces a layout). */
function obstacles(p: ArrowSpot): Box[] {
  const now = performance.now();
  if (now - blockCache.at > 250) {
    const boxes: Box[] = [];
    document.querySelectorAll<HTMLElement>(BLOCKERS).forEach((el) => {
      if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) boxes.push({ l: r.left - 4, r: r.right + 4, t: r.top - 4, b: r.bottom + 4 });
    });
    blockCache = { at: now, boxes };
  }
  // Only the target itself is left out. A panel the target sits in still counts, so the arrow points at
  // a button from the open space beside its panel instead of landing on the panel's other buttons.
  const hw = Math.max(12, (p.w ?? 24) / 2) + 10;
  return blockCache.boxes.filter((o) => !(o.l >= p.x - hw && o.r <= p.x + hw && o.t >= p.top - 10 && o.b <= p.bottom + 10));
}
// Pinned to the edge, it stays clear of the toolbars along the top and the timeline at the bottom
const EDGE = { top: 150, bottom: 120, side: 80 };

/**
 * Game-style quest arrow: a big glowing arrow bobbing over the destination, or, when the destination is
 * off screen, parked at the screen edge pointing the way, with how far it is.
 * `locate` is called every frame, so it should be cheap.
 */
export default function QuestArrow({ locate }: { locate: () => ArrowSpot | null }) {
  const root = useRef<HTMLDivElement>(null);
  const turn = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const locateRef = useRef(locate);
  locateRef.current = locate;

  useEffect(() => {
    let raf = 0;
    let last = "";
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = root.current, rot = turn.current, label = tag.current, rg = ring.current;
      if (!el || !rot || !label || !rg) return;
      const p = locateRef.current();
      if (!p) {
        if (last !== "off") (el.style.display = "none"), (rg.style.display = "none"), (last = "off");
        return;
      }
      const W = window.innerWidth, H = window.innerHeight;
      const onScreen = !p.behind && p.x > M && p.x < W - M && p.bottom > M && p.top < H - M;
      let x: number, y: number, deg: number, mode: string;
      let hidden = false;
      const blocks = obstacles(p);
      if (onScreen) {
        // Hover just outside the target pointing at it: above if that's clear, otherwise from the first
        // angle around it that doesn't sit on a panel or text box (re-checked every frame, so it swings
        // back above once that space frees up)
        const cx = p.x, cy = (p.top + p.bottom) / 2, hx = Math.max(12, (p.w ?? 24) / 2), hy = Math.max(12, (p.bottom - p.top) / 2);
        let pick: { tx: number; ty: number; ux: number; uy: number } | null = null;
        // nearest open space first: right beside the target, then further out, at any angle around it
        search: for (const gap of GAPS)
          for (const a of AROUND) {
            const ux = Math.sin(a), uy = -Math.cos(a); // a = 0 is straight up
            const t = Math.min(hx / Math.max(1e-6, Math.abs(ux)), hy / Math.max(1e-6, Math.abs(uy))) + gap;
            const tx = cx + ux * t, ty = cy + uy * t; // the arrow's tip
            const bx = tx + ux * 24, by = ty + uy * 24; // the middle of the arrow (bobbing included)
            const box = { l: bx - 27, r: bx + 27, t: by - 27, b: by + 27 };
            if (box.l < 4 || box.t < 4 || box.r > W - 4 || box.b > H - 4) continue;
            if (blocks.some((o) => box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t)) continue;
            pick = { tx, ty, ux, uy };
            break search;
          }
        // never on top of the interface: with no open space at all, only the ring shows
        hidden = !pick;
        pick ??= { tx: cx, ty: p.top - 8, ux: 0, uy: -1 };
        x = pick.tx;
        y = pick.ty;
        deg = (Math.atan2(-pick.uy, -pick.ux) * 180) / Math.PI - 90; // the arrow is drawn pointing down
        mode = "over";
      } else {
        // pin to the screen edge, pointing toward it
        const cx = W / 2, cy = (EDGE.top + H - EDGE.bottom) / 2;
        let dx = p.x - cx, dy = (p.top + p.bottom) / 2 - cy;
        if (p.behind) [dx, dy] = [-dx, -dy];
        const hw = Math.max(40, W / 2 - EDGE.side), hh = Math.max(40, (H - EDGE.top - EDGE.bottom) / 2);
        const k = Math.min(hw / Math.max(1e-6, Math.abs(dx)), hh / Math.max(1e-6, Math.abs(dy)));
        x = cx + dx * k;
        y = cy + dy * k;
        // slide in from the edge (and sideways along it) until it and its label are clear of panels
        const len = Math.hypot(dx, dy) || 1, sx = -dx / len, sy = -dy / len, px = -sy, py = sx;
        const x0 = x, y0 = y;
        let clear = false;
        edge: for (let n = 0; n < 24; n++)
          for (const side of [0, 60, -60, 120, -120]) {
            const tx = x0 + sx * 20 * n + px * side, ty = y0 + sy * 20 * n + py * side;
            const box = { l: tx - 62, r: tx + 62, t: ty - 42, b: ty + 42 };
            if (box.l < 4 || box.t < 4 || box.r > W - 4 || box.b > H - 4) continue;
            if (blocks.some((o) => box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t)) continue;
            x = tx;
            y = ty;
            clear = true;
            break edge;
          }
        hidden = !clear;
        deg = (Math.atan2(dy, dx) * 180) / Math.PI - 90; // the arrow is drawn pointing down
        mode = "edge";
      }
      const key = `${mode}|${hidden}|${x.toFixed(0)}|${y.toFixed(0)}|${deg.toFixed(0)}|${p.label ?? ""}|${p.w ?? 0}|${p.bottom.toFixed(0)}`;
      if (key === last) return;
      last = key;
      // a pulsing ring around the destination while it's on screen (a circle for a point, a pill for a control)
      if (onScreen) {
        const h = Math.max(36, p.bottom - p.top + 14), w = Math.max(h, (p.w ?? 0) + 14);
        rg.style.display = "";
        rg.style.width = `${w.toFixed(0)}px`;
        rg.style.height = `${h.toFixed(0)}px`;
        rg.style.transform = `translate(${(p.x - w / 2).toFixed(1)}px, ${((p.top + p.bottom) / 2 - h / 2).toFixed(1)}px)`;
      } else rg.style.display = "none";
      el.style.display = hidden ? "none" : "";
      el.className = `qa ${mode}`;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      rot.style.transform = `rotate(${deg.toFixed(1)}deg)${mode === "edge" ? " scale(.75)" : ""}`;
      label.textContent = mode === "edge" ? (p.label ?? "") : "";
      if (mode === "edge") {
        // the name sits on the screen side of the arrow, so it never runs off the edge
        const a = ((deg + 90) * Math.PI) / 180, ox = -Math.cos(a) * 52, oy = -Math.sin(a) * 40;
        label.style.transform = `translate(calc(-50% + ${ox.toFixed(0)}px), calc(-50% + ${oy.toFixed(0)}px))`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
    <div ref={ring} className="qa-ring" style={{ display: "none" }} aria-hidden="true">
      <i />
    </div>
    <div ref={root} className="qa" style={{ display: "none" }} aria-hidden="true">
      <div ref={turn} className="qa-turn">
        <div className="qa-bob">
          <svg viewBox="0 0 40 44" width="40" height="44">
            {/* waypoint triangle pointing down: tip at the bottom centre */}
            <path d="M4 3 H36 L20 41 Z" fill="#ffe873" stroke="#3a2205" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span ref={tag} className="qa-tag" />
    </div>
    </>
  );
}
