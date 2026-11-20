
"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallButton() {
  const [prompt, setPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();

      setPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    const checkInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    window.addEventListener(
      "appinstalled",
      checkInstalled
    );

    // Check if already running as an installed app
    if (
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );

      window.removeEventListener(
        "appinstalled",
        checkInstalled
      );
    };
  }, []);

  const installApp = async () => {
    if (!prompt) return;

    await prompt.prompt();

    const choice = await prompt.userChoice;

    if (choice.outcome === "accepted") {
      setPrompt(null);
    }
  };

  if (!prompt || installed) return null;

  return (
    <button
      type="button"
      onClick={installApp}
      title="Install BuyNest App"
      aria-label="Install BuyNest App"
      className="group flex h-11 w-11 items-center justify-center rounded-xl text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-600"
    >
      <Download
        size={23}
        strokeWidth={2}
      />
    </button>
  );
}
