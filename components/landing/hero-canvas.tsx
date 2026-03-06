"use client";

import { useEffect, useRef } from "react";
import { createAnimationController } from "./hero-animation/scene";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const controller = createAnimationController(canvas);

    const startTimeout = setTimeout(() => controller.start(), 50);

    const resizeObserver = new ResizeObserver(() => {
      controller.resize();
    });
    resizeObserver.observe(canvas);

    const handleVisibility = () => {
      if (document.hidden) controller.stop();
      else controller.start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(startTimeout);
      controller.stop();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    />
  );
}
