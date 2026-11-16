import type { Metadata } from "next";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SiteTabs from "@/components/SiteTabs";
import { site, project, access, writeup } from "@/content/site";
import "../home.css";

export const metadata: Metadata = {
  title: "Project | Orbit3D",
  description: "What Orbit3D is, why Team Big Bang built it, and a demo.",
};

export default function ProjectPage() {
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
          <SiteTabs active="project" />
        </div>
        <div className="h-hero-copy">
          <p className="h-kicker">The project</p>
          <h1>What we built, and <em>why</em></h1>
          <p className="h-lede">Orbit3D turns NASA&apos;s SPHEREx sky survey into something anyone can explore. Here&apos;s our write-up, a demo, and who it&apos;s for.</p>
        </div>
      </header>

      <main className="sub-main">
        {/* ── Project ── */}
        <section id="project" className="h-section">
          <h2 className="h-split center">
            {site.brand} <span>01 · The project</span>
          </h2>
          <div className="h-writeup">
            <div className="h-box">
              <h3>Summary</h3>
              <p>{writeup.summary}</p>
              <p className="h-writeup-link">
                <b>Project</b> <a href={writeup.projectUrl}>{writeup.projectUrl.replace("https://", "")}</a>
              </p>
            </div>
            <div className="h-box">
              <h3>Project Demonstration</h3>
              <div className="h-video">
                <iframe
                  src={writeup.demoEmbed}
                  title="Orbit3D project demonstration video"
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="h-writeup-link">
                <a href={writeup.demoUrl} target="_blank" rel="noreferrer">
                  Watch on YouTube ↗
                </a>
              </p>
            </div>
            <div className="h-box h-writeup-details">
              <h3>Project Details</h3>
              {writeup.details.map((d) => (
                <p key={d.slice(0, 40)}>{d}</p>
              ))}
              <h3>Built with</h3>
              <ul className="h-tags">
                {project.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Accessible to everyone ── */}
        <section id="access" className="h-section">
          <h2 className="h-split center">
            For anyone, anywhere <span>02 · Access</span>
          </h2>
          <div className="h-access">
            <h3>{access.title}</h3>
            <p className="h-access-lead">{access.lead}</p>
            <ul>
              {access.points.map((pt) => (
                <li key={pt.title}>
                  <b>{pt.title}</b>
                  <span>{pt.text}</span>
                </li>
              ))}
            </ul>
            <p className="h-access-close">{access.close}</p>
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
