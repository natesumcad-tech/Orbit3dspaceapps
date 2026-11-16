"use client";

import { useEffect, useRef } from "react";

/**
 * Where the arrow should point, in screen pixels. `top`/`bottom` are the target's edges (the arrow
 * hovers just above it, or below when there's no room). `behind` marks a point projected from behind
 * the camera, whose direction is reversed.
 */
export type ArrowSpot = { x: number; top: number; bottom: number; behind?: boolean; label?: string; /** width of a control to ring (points get a circle) */ w?: number };

const M = 54; // keep the arrow this far inside the screen edges
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
      if (onScreen) {
        // hover over it pointing down (or under it pointing up if it's right at the top)
        const under = p.top < 86;
        x = p.x;
        y = under ? p.bottom + 8 : p.top - 8;
        deg = under ? 180 : 0;
        mode = under ? "over under" : "over";
      } else {
        // pin to the screen edge, pointing toward it
        const cx = W / 2, cy = (EDGE.top + H - EDGE.bottom) / 2;
        let dx = p.x - cx, dy = (p.top + p.bottom) / 2 - cy;
        if (p.behind) [dx, dy] = [-dx, -dy];
        const hw = Math.max(40, W / 2 - EDGE.side), hh = Math.max(40, (H - EDGE.top - EDGE.bottom) / 2);
        const k = Math.min(hw / Math.max(1e-6, Math.abs(dx)), hh / Math.max(1e-6, Math.abs(dy)));
        x = cx + dx * k;
        y = cy + dy * k;
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
