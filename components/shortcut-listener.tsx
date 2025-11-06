"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShortcutListener() {
  const router = useRouter();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        const search = document.querySelector<HTMLInputElement>("[data-search]");
        search?.focus();
      }

      if (event.key === "g") {
        if (event.metaKey || event.ctrlKey) return;
        const stack = (window as any).__lastKeys ?? [];
        stack.push(Date.now());
        (window as any).__lastKeys = stack.slice(-2);

        if (stack.length >= 2) {
          const [prev, curr] = stack.slice(-2);
          if (curr - prev < 400) {
            router.push("/dashboard");
          }
        }
      }

      if (event.key === "n" && !(event.metaKey || event.ctrlKey)) {
        const newButton = document.querySelector<HTMLButtonElement>("[data-new-record]");
        if (newButton) {
          event.preventDefault();
          newButton.click();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
