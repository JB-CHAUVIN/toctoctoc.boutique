"use client";

import { useEffect } from "react";

/** Scroll le conteneur parent overflow-y-auto vers le haut au montage */
export function ScrollToTop() {
  useEffect(() => {
    // Le layout dashboard utilise un <div class="overflow-y-auto"> comme conteneur scrollable
    const scrollable = document.querySelector("main .overflow-y-auto") ?? window;
    if (scrollable instanceof HTMLElement) {
      scrollable.scrollTo({ top: 0 });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, []);

  return null;
}
