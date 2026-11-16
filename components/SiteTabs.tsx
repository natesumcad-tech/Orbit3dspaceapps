import Link from "next/link";
import "./site-tabs.css";

/** The site's tabs. On the map (`compact`) only Home, Orbit3D and Contact, leaving room for the map's own buttons. */
export default function SiteTabs({ active, compact = false }: { active: "home" | "explorer" | "project" | "credits" | "contact"; compact?: boolean }) {
  return (
    <nav className="site-tabs" aria-label="Main navigation">
      <Link transitionTypes={["site-navigation"]} href="/" aria-current={active === "home" ? "page" : undefined}>Home</Link>
      <Link transitionTypes={["site-navigation"]} href="/map" aria-current={active === "explorer" ? "page" : undefined}>Orbit3D</Link>
      {!compact && (
        <>
          <Link transitionTypes={["site-navigation"]} href="/project" aria-current={active === "project" ? "page" : undefined}>Project</Link>
          <Link transitionTypes={["site-navigation"]} href="/credits" aria-current={active === "credits" ? "page" : undefined}>Credits</Link>
        </>
      )}
      <Link transitionTypes={["site-navigation"]} href="/contact" className="tab-contact" aria-current={active === "contact" ? "page" : undefined}>Contact</Link>
    </nav>
  );
}
