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
const AROUND = [0, -0.6, 0.6, -1.15, 1.15, -Math.PI / 2, Math.PI / 2, -2.1, 2.1, Math.PI];

/** Panels and text boxes the arrow mustn't cover. */
const BLOCKERS =
  ".q-card, .q-mini, .tour-card, .tour-banner, .site-tabs, .mv-glass, .mv-blink-bar, .mv-coord-form, .mv-coord-center, .mv-wrench, .mv-pop, .mv-ai.open, .xp-card, .xp-move, .xp-toolbar, .xp-hint, .xp-zoom, .bk-card, .cv-hud, .cv-card";
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
  // a panel the target sits inside (a button in a card) can't be avoided: leave it out
  const cy = (p.top + p.bottom) / 2;
  return blockCache.boxes.filter((o) => !(p.x > o.l && p.x < o.r && cy > o.t && cy < o.b));
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
      const blocks = obstacles(p);
      if (onScreen) {
        // Hover just outside the target pointing at it: above if that's clear, otherwise from the first
        // angle around it that doesn't sit on a panel or text box (re-checked every frame, so it swings
        // back above once that space frees up)
        const cx = p.x, cy = (p.top + p.bottom) / 2, hx = Math.max(12, (p.w ?? 24) / 2), hy = Math.max(12, (p.bottom - p.top) / 2);
        let pick: { tx: number; ty: number; ux: number; uy: number } | null = null;
        let best: { tx: number; ty: number; ux: number; uy: number; cover: number } | null = null;
        search: for (const gap of [8, 44]) // right next to it first, then a little further out
          for (const a of AROUND) {
            const ux = Math.sin(a), uy = -Math.cos(a); // a = 0 is straight up
            const t = Math.min(hx / Math.max(1e-6, Math.abs(ux)), hy / Math.max(1e-6, Math.abs(uy))) + gap;
            const tx = cx + ux * t, ty = cy + uy * t; // the arrow's tip
            const bx = tx + ux * 24, by = ty + uy * 24; // the middle of the arrow (bobbing included)
            const box = { l: bx - 26, r: bx + 26, t: by - 26, b: by + 26 };
            if (box.l < 4 || box.t < 4 || box.r > W - 4 || box.b > H - 4) continue;
            let cover = 0;
            for (const o of blocks) cover += Math.max(0, Math.min(box.r, o.r) - Math.max(box.l, o.l)) * Math.max(0, Math.min(box.b, o.b) - Math.max(box.t, o.t));
            if (cover === 0) {
              pick = { tx, ty, ux, uy };
              break search;
            }
            if (!best || cover < best.cover - 1) best = { tx, ty, ux, uy, cover };
          }
        // nowhere fully clear: the spot that covers the least
        pick ??= best ?? { tx: cx, ty: p.top - 8, ux: 0, uy: -1 };
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
        // slide in from the edge until it's clear of panels (with its label)
        const len = Math.hypot(dx, dy) || 1, sx = -dx / len, sy = -dy / len;
        for (let n = 0; n < 16; n++) {
          const box = { l: x - 60, r: x + 60, t: y - 40, b: y + 40 };
          if (!blocks.some((o) => box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t)) break;
          x += sx * 24;
          y += sy * 24;
        }
        deg = (Math.atan2(dy, dx) * 180) / Math.PI - 90; // the arrow is drawn pointing down
        mode = "edge";
      }
      const key = `${mode}|${x.toFixed(0)}|${y.toFixed(0)}|${deg.toFixed(0)}|${p.label ?? ""}|${p.w ?? 0}|${p.bottom.toFixed(0)}`;
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
      el.style.display = "";
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
          <svg viewBox="0 0 40 36" width="40" height="36">
            {/* waypoint triangle pointing down: tip at the bottom centre */}
            <path d="M3 3 H37 L20 33 Z" fill="#ffe873" stroke="#3a2205" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <span ref={tag} className="qa-tag" />
    </div>
    </>
  );
}
