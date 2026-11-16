// ─────────────────────────────────────────────────────────────
//  The site's text: project description, mission facts, sources and credits.
// ─────────────────────────────────────────────────────────────

export const site = {
  brand: "Orbit3D",
  projectName: "Orbit3D",
  team: "Team Big Bang",
  contactEmail: "nasaorbit3dbusiness@gmail.com",
  tagline:
    "Step inside the sky NASA's SPHEREx is mapping: real stars, planets and the Milky Way in 360°.",
  event: "NASA Space Apps Challenge",
};

export const project = {
  challenge: "Planet X & SPHEREx",
  problem:
    "SPHEREx is mapping the entire sky in 102 infrared colors, but its data lives in archives built for astronomers. Most people never get to see what it is exploring, or why it matters.",
  solution:
    "Orbit3D: a Google Maps-style map of the whole sky, streamed live from SPHEREx's real infrared data. Fly over it in 2D or 3D, switch between SPHEREx's 102 colors, step into 360° views of planets and constellations at their real distances, and blink two real SPHEREx passes taken six months apart to catch things that move: the same method you'd use to hunt for a Planet X.",
  howItWorks: [
    "Fly over the whole sky, streamed live from SPHEREx data at NASA/IPAC IRSA, from a single star out to the entire Milky Way",
    "Switch SPHEREx colors, jump to exact RA/Dec coordinates, and blink real exposures six months apart to spot moving objects",
    "Step into 360° views of planets, stars and constellations, and fly through them in 3D",
    "Learn by doing: a one-minute tour, an AI sky guide, and an optional rescue mission that teaches coordinates with real data",
  ],
  tools: ["Next.js", "three.js", "TypeScript", "Vercel", "SPHEREx DR1 (IRSA)", "HYG star catalogue", "JPL orbital elements", "SIMBAD", "Google Gemini"],
};

/** Why this exists: making SPHEREx's public data usable by anyone, anywhere. */
export const access = {
  title: "The sky is public. The data should feel that way too.",
  lead:
    "Every SPHEREx image is free to download, but the archive was built for professional astronomers: FITS files, query forms and catalogue jargon. That quietly shuts out the people most likely to fall in love with it, students without an observatory, a telescope or a mentor nearby. We built this to close that gap.",
  points: [
    { title: "Nothing to install, nothing to pay", text: "It runs in the browser on a school Chromebook or a phone, with a battery-saver mode for older devices. No account, no download, no fees." },
    { title: "In your language", text: "English and Spanish, picked automatically from your browser, with every star, planet, mission line and button translated." },
    { title: "Learn by doing", text: "A one-minute tour, a guided rescue mission and a sky guide that answers questions, so coordinates and infrared light make sense because you've used them." },
    { title: "A path to real science", text: "The same exposures researchers download, ready to open in Python, and links to citizen-science projects where anyone can help make real discoveries." },
    { title: "Open to everyone", text: "Usable with a keyboard or a screen reader, and checked against accessibility standards on every screen." },
  ],
  close: "Wherever you are, if you're curious about the universe, you should be able to explore the same sky the scientists do.",
};

/** The team's project write-up, word for word (as submitted). */
export const writeup = {
  summary:
    "Orbit3D is a compilation of the data from SPHEREx, turned into a user-friendly and engaging website. As space enthusiasts load into the webpage, they are greeted with friendly UI and easy to understand explanations of how the data is presented. After opening the map itself, a tutorial opens up to show beginners how to use the tool. This immersive web application directly addresses the prompt by allowing anybody on the internet to access and understand data from the SPHEREx mission. You can explore the changes we have observed in our universe by moving across the timeline at the bottom of the map. The intuitive controls make this experience accessible to any person, regardless of experience in the field of astronomy. The importance of Orbit3D is shown in its limitless ability to further the education of up and coming generations. Future young explorers could use the vast tools provided by our website to explore the universe, and ask questions with our personal AI chatbot. Encouraging curiosity in these fields creates a bright future for humans, when we make plans to pack our bags and head out into the unknown depths of space.",
  demoUrl: "https://youtu.be/gh6pHNaw74M",
  demoEmbed: "https://www.youtube-nocookie.com/embed/gh6pHNaw74M",
  projectUrl: "https://orbit3d.earth",
  details: [
    "For our project, we built Orbit3D, an interactive web app letting anyone explore NASA's Spherex infrared sky survey the way you would use Google Maps or Street View. When we first delved into the challenge, we realized that the Spherex data mostly sat inside scientific archives intimidating to those not working in astronomy. We wanted to build something where a student, teacher, or anyone curious could just open the site in their browser and start exploring infrared space.",
    "Sky Explorer streams live Spherex DR1 imagery straight from the IRSA along with extra surveys like 2MASS, MSX, and Spitzer. Behind the scenes, web background proccesses download sky tiles and reproject them onto a smooth 2d/3d map. You can fly across the sky, check out Spherex's 102 wavelength bands to see how dust clouds and starts look in different parts of the spectrum, jump to RA/Dec coordinates, and locate Spherex data files of whatever you are viewing.",
    "We didn't want people to feel lost on what to actually look for. So alongside a free roam experience, we added a short interactive tutorial, a built in Sky Guide chat to explain and travel to targets, and a story mission. In the mission, you help a stranded ship regain its bearings by reading real RA/Dec coordinates and switching infrared bands on live Spherex cutouts.",
    "Everything was built on our regular laptops using TypeScript, React, Next.js, HTML/CSS, and Three.js for rendering, hosted as a web app on Vercel. To line up the sky tiling accurately, we connected live data from ISRA with star catalogs and constellation lines, used JPL orbital elements to track planets, and wired up SIMBAD so that Sky Guide could look up astronomical objects when answering questions.",
    "While putting together this app, we spent much of our time thinking about where this site would be used. Rendering  a 3d map while streaming 102 band tiles can easiler slow older generation laptops and phones, soo we kept tile generation in background threads, cached chatbot lookups, set up a low quality mode for modest hardware, and added translations for both English and Spanish. Lastly, a big thing we considered was keeping true to science. None of the space imagery is AI generated, and all AI generated illustrations or story elements are clearly pointed out.",
  ],
};

export const mission = {
  stats: [
    { value: "102", label: "infrared colors (spectral bands)" },
    { value: "0.75–5 µm", label: "wavelength coverage" },
    { value: "Every 6 mo", label: "full map of the sky" },
    { value: "450M+", label: "galaxies to be measured" },
  ],
  goals: [
    {
      title: "The first moments of the Universe",
      body: "By mapping the 3D positions of hundreds of millions of galaxies, SPHEREx looks for faint patterns left by cosmic inflation, the burst of expansion in the first fraction of a second after the Big Bang.",
    },
    {
      title: "The history of galaxies",
      body: "SPHEREx measures the total glow of all galaxies, including ones too faint to see on their own, to trace how much light galaxies have made across cosmic time.",
    },
    {
      title: "Water and ice in our galaxy",
      body: "Spectra of millions of stars behind dusty clouds reveal frozen water, carbon dioxide and other ices, which are ingredients for planets and possibly for life.",
    },
  ],
  facts: [
    ["Full name", "Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer"],
    ["Launched", "March 11, 2025 on a SpaceX Falcon 9 from Vandenberg Space Force Base"],
    ["Orbit", "Sun-synchronous polar orbit, about 700 km above Earth"],
    ["Telescope", "20 cm aperture, passively cooled behind three cone-shaped photon shields"],
    ["Survey", "Four all-sky maps over a two-year prime mission"],
    ["Managed by", "NASA JPL, with Caltech leading the science"],
  ],
};

export const resources = [
  { title: "SPHEREx mission page", url: "https://science.nasa.gov/mission/spherex/", note: "NASA Science" },
  { title: "SPHEREx at JPL", url: "https://www.jpl.nasa.gov/missions/spherex/", note: "Mission news & images" },
  { title: "SPHEREx data at IRSA", url: "https://irsa.ipac.caltech.edu/Missions/spherex.html", note: "Public data archive" },
  { title: "SPHEREx science team", url: "https://spherex.caltech.edu/", note: "Caltech" },
  { title: "NASA Space Apps Challenge", url: "https://www.spaceappschallenge.org/", note: "Hackathon home" },
];

/** Data sources, software and acknowledgments (shown in the Credits section). */
export const credits: { title: string; text: string; url?: string }[] = [
  {
    title: "SPHEREx",
    url: "https://science.nasa.gov/mission/spherex/",
    text: "This project uses data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, funded by NASA. Images: SPHEREx Data Release 1 all-sky maps and Level 2 exposures.",
  },
  {
    title: "NASA/IPAC Infrared Science Archive (IRSA)",
    url: "https://irsa.ipac.caltech.edu/",
    text: "This research has made use of the NASA/IPAC Infrared Science Archive, which is funded by NASA and operated by the California Institute of Technology. All SPHEREx, 2MASS, Spitzer and MSX imagery is streamed from IRSA.",
  },
  {
    title: "2MASS, Spitzer and MSX",
    text: "2MASS is a joint project of the University of Massachusetts and IPAC/Caltech, funded by NASA and NSF. Spitzer was operated by JPL/Caltech for NASA. MSX data from the Midcourse Space Experiment, via IRSA.",
  },
  {
    title: "HYG star database v4.1",
    url: "https://github.com/astronexus/HYG-Database",
    text: "Star names, positions and distances by David Nash (astronexus), CC BY-SA 4.0. Derived from Hipparcos, Yale Bright Star and Gliese catalogues.",
  },
  {
    title: "d3-celestial",
    url: "https://github.com/ofrohn/d3-celestial",
    text: "Constellation lines and star catalogue data by Olaf Frohn, BSD-3-Clause license.",
  },
  {
    title: "SIMBAD",
    url: "https://simbad.cds.unistra.fr/",
    text: "This research has made use of the SIMBAD database, operated at CDS, Strasbourg, France (used by the sky guide to identify objects).",
  },
  {
    title: "Planet positions",
    text: "Computed from JPL's approximate Keplerian orbital elements (E. M. Standish). Good to a few arcminutes, so planet markers are drawn as rings.",
  },
  {
    title: "What's illustrated",
    text: "Planet and star surfaces in 360° views, Earth's globe, and the Milky Way's overall shape are illustrations, not photographs. Commander Ada Reyes and her ship in the rescue mission are fiction; every image and number she shows is real data.",
  },
  {
    title: "Software",
    text: "Built with Next.js, React, three.js and TypeScript, hosted on Vercel.",
  },
];

/** How AI was used to build and run the project (disclosed per Space Apps rules). */
export const aiUse: { title: string; text: string }[] = [
  {
    title: "Coding assistant",
    text: "Much of the code was built with help from an AI coding assistant (Anthropic's Claude), with the design directed and the results reviewed and tested by hand.",
  },
  {
    title: "Sky guide",
    text: "The in-app sky guide answers questions with Google Gemini, grounded in NASA reference text and SIMBAD lookups. Its answers can be wrong, and it says so.",
  },
  {
    title: "Data stays real",
    text: "No images or measurements are AI-generated. Every SPHEREx image comes straight from NASA/IPAC IRSA.",
  },
];
