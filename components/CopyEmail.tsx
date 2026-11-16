"use client";

import { useState } from "react";

/** The contact address as a mail link, with a button that copies it. */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="c-email">
      <a href={`mailto:${email}`} className="c-email-link">
        {email}
      </a>
      <button
        type="button"
        className="c-copy"
        onClick={() => {
          const done = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          };
          navigator.clipboard?.writeText(email).then(done, done);
        }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
