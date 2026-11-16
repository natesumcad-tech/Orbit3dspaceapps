/** The Orbit3D tour's steps. */

export type Wait = "move" | "hover" | "modes" | "sphere" | "zoomout";
export type Step = {
  /** CSS selector(s) of the control(s) to spotlight (none: nothing highlighted). */
  target?: string | string[];
  title: string;
  body: string;
  /** Wording for touch screens, where it differs. */
  touch?: { body: string; prompt?: string };
  /** Something to try: the step notices when you do it and moves on by itself. */
  wait?: { kind: Wait; prompt: string };
};

export const STEPS: Step[] = [
  {
    title: "Welcome to Orbit3D",
    body: "The whole sky, built from NASA's SPHEREx telescope. This quick tour takes under a minute.",
  },
  {
    title: "Look around",
    body: "Drag to move around the sky, and scroll to zoom in and out. Try both.",
    touch: { body: "Drag with one finger to move, pinch to zoom, and twist two fingers to rotate.", prompt: "Drag or pinch the map" },
    wait: { kind: "move", prompt: "Drag or scroll the map" },
  },
  {
    target: ".mv-top-row .mv-seg",
    title: "Tilt into 3D",
    body: "Flip between a flat star chart and a tilted 3D view.",
    wait: { kind: "modes", prompt: "" },
  },
  {
    target: "visible-3d",
    title: "Step inside in 3D",
    body: "Planets and constellations are real 3D scenes. Click one to fly there, click it again to step inside, then drag the dial in the Move panel to travel around it.",
    wait: { kind: "sphere", prompt: "Open a planet or constellation" },
  },
  {
    target: [".mv-search-btn", ".mv-ask"],
    title: "Find anything",
    body: "Search for a star, planet or constellation, or ask the sky guide a question.",
  },
  {
    target: ".mv-minicard",
    title: "Your overview",
    body: "This minimap shows where you are in the whole sky; click it to jump anywhere. Below it you can switch SPHEREx colors, and zooming all the way out (or ⊙) shows the entire Milky Way.",
  },
  {
    target: ".mv-blink-bar",
    title: "Hunt for Planet X",
    body: "Blink flips between two real SPHEREx images of the same spot, taken six months apart. Stars stay put; anything in our solar system jumps. Try ★ Planets moving to watch Neptune and Saturn do it.",
  },
  {
    target: ".mv-zoom",
    title: "Zoom out to see everything",
    body: "Keep zooming out (scroll out, press X, or hit ⊙) until the whole sky turns into our Milky Way galaxy. You can always come back out here to see everything at once.",
    touch: { body: "Pinch out, again and again (or tap ⊙), until the whole sky turns into our Milky Way galaxy.", prompt: "Pinch out until you see the Milky Way" },
    wait: { kind: "zoomout", prompt: "Zoom all the way out" },
  },
  {
    title: "You're all set",
    body: "Press the ? button any time to see this again.",
  },
];
