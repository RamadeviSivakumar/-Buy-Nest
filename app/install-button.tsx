
"use client";

import { useState, useEffect } from "react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!prompt) return;

    await prompt.prompt();
    setPrompt(null);
  };

  if (!prompt) return null;

  return (
    <button
      onClick={installApp}
      className="rounded-lg bg-blue-600 px-5 py-3 text-white"
    >
      Download BuyNest App
    </button>
  );
}
