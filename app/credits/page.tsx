import type { Metadata } from "next";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SiteTabs from "@/components/SiteTabs";
import { site, resources, credits, aiUse } from "@/content/site";
import "../home.css";

export const metadata: Metadata = {
  title: "Credits | Orbit3D",
  description: "The data, code and references behind Orbit3D.",
};

export default function CreditsPage() {
  return (
    <PageTransition>
    <div className="home">
      <header className="h-hero sub-hero">
        <div className="h-sky" aria-hidden="true" />
        <div className="h-nav">
          <div className="h-brand">
            <Link href="/" className="h-logo">
              <span className="h-logo-mark" aria-hidden="true" />
              {site.brand}
            </Link>
          </div>
          <SiteTabs active="credits" />
        </div>
        <div className="h-hero-copy">
          <p className="h-kicker">Credits</p>
          <h1>The data and people <em>behind it</em></h1>
          <p className="h-lede">Every image in Orbit3D is real NASA data. Here&apos;s where it comes from, the references we used, and how everything was built.</p>
        </div>
      </header>

      <main className="sub-main">
        {/* ── Resources ── */}
        <section className="h-section">
          <h2 className="h-split center">
            Data & references <span>01 · Sources</span>
          </h2>
          <ul className="h-resources">
            {resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  <b>{r.title}</b>
                  <span>{r.note} ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Credits & AI use ── */}
        <section id="credits" className="h-section">
          <h2 className="h-split center">
            Credits <span>02 · Data, code & AI</span>
          </h2>
          <div className="h-project">
            <div className="h-box">
              <h3>Data and acknowledgments</h3>
              <ul className="h-credits">
                {credits.map((c) => (
                  <li key={c.title}>
                    <b>{c.url ? <a href={c.url} target="_blank" rel="noreferrer">{c.title}</a> : c.title}</b>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-box">
              <h3>How AI was used</h3>
              <ul className="h-credits">
                {aiUse.map((c) => (
                  <li key={c.title}>
                    <b>{c.title}</b>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-footer">
        <span>
          Built by {site.team} for the {site.event}.
        </span>
        <span>
          <Link href="/contact">Contact us</Link> · <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> · <Link href="/credits">Credits</Link>
        </span>
        <span className="h-fine">
          SPHEREx mission information courtesy of NASA/JPL-Caltech. A student hackathon project, not an official NASA website.
        </span>
      </footer>
    </div>
    </PageTransition>
  );
}
