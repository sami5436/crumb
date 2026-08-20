"use client";

import { useState } from "react";

export default function CopyLink() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy this starter's private link"
      className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:border-crust hover:text-crust"
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
