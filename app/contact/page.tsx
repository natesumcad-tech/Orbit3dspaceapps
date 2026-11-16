import type { Metadata } from "next";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import SiteTabs from "@/components/SiteTabs";
import CopyEmail from "@/components/CopyEmail";
import { site } from "@/content/site";
import "../home.css";
import "./contact.css";

export const metadata: Metadata = {
  title: `Contact | ${site.brand}`,
  description: `Get in touch with ${site.team}, the team behind ${site.brand}.`,
};

const REASONS = [
  { title: "Teachers and schools", text: "Want to use Orbit3D in a lesson or a club? Tell us your students' age and what you're teaching, and we'll help you get started." },
  { title: "Feedback and bugs", text: "Something confusing, broken or slow on your device? Tell us what you were doing and what you expected to happen." },
  { title: "Ideas", text: "A feature, a language, a part of the sky you'd love to explore. We read everything." },
  { title: "Collaborations", text: "Researchers, outreach programs and other builders working with SPHEREx or open space data: we'd love to talk." },
];

export default function ContactPage() {
  return (
    <PageTransition>
      <div className="home">
        <header className="h-hero c-hero">
          <div className="h-sky" aria-hidden="true" />
          <div className="h-nav">
            <div className="h-brand">
              <Link href="/" className="h-logo">
                <span className="h-logo-mark" aria-hidden="true" />
                {site.brand}
              </Link>
            </div>
            <SiteTabs active="contact" />
          </div>

          <div className="h-hero-copy">
            <p className="h-kicker">Contact us</p>
            <h1>
              Say hello to <em>{site.team}</em>
            </h1>
            <p className="h-lede">
              {site.brand} was made by {site.team} for the {site.event} (Planet X &amp; SPHEREx challenge). We built it so anyone, anywhere,
              can explore the real sky NASA&apos;s SPHEREx is mapping, and we&apos;d love to hear from you.
            </p>
          </div>
        </header>

        <main className="c-main">
          <section className="c-card" aria-labelledby="c-email-title">
            <h2 id="c-email-title">Email us</h2>
            <p>The quickest way to reach the team:</p>
            <CopyEmail email={site.contactEmail} />
            <p className="c-fine">We&apos;re a student team, so give us a few days to reply.</p>
          </section>

          <section aria-labelledby="c-why-title">
            <h2 id="c-why-title" className="c-sub">What to write to us about</h2>
            <ul className="c-reasons">
              {REASONS.map((r) => (
                <li key={r.title}>
                  <b>{r.title}</b>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="c-card c-about" aria-labelledby="c-about-title">
            <h2 id="c-about-title">About {site.team}</h2>
            <p>
              We&apos;re {site.team}, the team behind {site.brand}. We made it for the {site.event} to turn SPHEREx&apos;s public infrared data into
              something anyone can fly through, learn from and use for real science: a 3D map of the whole sky, a rescue mission that teaches
              coordinates, and the same files researchers download.
            </p>
            <div className="c-actions">
              <Link href="/map" className="h-btn">
                <span aria-hidden="true">◎</span> Open {site.brand}
              </Link>
              <Link href="/" className="c-link">
                Back to the homepage
              </Link>
            </div>
          </section>
        </main>

        <footer className="h-footer">
          <span>
            Built by {site.team} for the {site.event}.
          </span>
          <span className="h-fine">
            SPHEREx mission information courtesy of NASA/JPL-Caltech. A student hackathon project, not an official NASA website.
          </span>
        </footer>
      </div>
    </PageTransition>
  );
}
