"use client";

import { useRef, useEffect, useState } from "react";
import type { Reward } from "@prisma/client";

interface Props {
  rewards: Reward[];
  spinning: boolean;
  primaryColor: string;
}

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = CENTER - 10;

export function RewardRoulette({ rewards, spinning, primaryColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const targetRotation = useRef<number>(0);
  // Trigger re-render for pointer (cosmetic only)
  const [, setTick] = useState(0);

  function getSliceLabel(reward: Reward): { text: string; isEmoji: boolean } {
    const emoji = reward.emoji?.trim();
    if (emoji) return { text: emoji, isEmoji: true };
    return { text: reward.name.slice(0, 4).toUpperCase(), isEmoji: false };
  }

  function drawWheel(rot: number) {
    const canvas = canvasRef.current;
    if (!canvas || rewards.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Apply HiDPI transform every frame (resetting after clearRect)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);

    const totalProb = rewards.reduce((sum, r) => sum + r.probability, 0);
    let startAngle = rot;

    rewards.forEach((reward) => {
      const sliceAngle = (reward.probability / totalProb) * Math.PI * 2;

      // ── Segment ──
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = reward.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // ── Label ──
      const midAngle = startAngle + sliceAngle / 2;
      const lx = CENTER + Math.cos(midAngle) * RADIUS * 0.63;
      const ly = CENTER + Math.sin(midAngle) * RADIUS * 0.63;

      const { text, isEmoji } = getSliceLabel(reward);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isEmoji) {
        // Emoji : pas de bold, taille généreuse, pas de shadow (moche sur emoji)
        ctx.font = `24px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.fillStyle = "#ffffff"; // ignoré pour les emoji mais nécessaire
        ctx.fillText(text, 0, 0);
      } else {
        // Texte court : bold blanc avec légère ombre pour lisibilité
        ctx.font = `bold 12px -apple-system, system-ui, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 3;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, 0, 0);
      }

      ctx.restore();
      startAngle += sliceAngle;
    });

    // ── Centre ──
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Initialise le canvas en haute résolution (une seule fois)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    drawWheel(rotationRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redessine quand les rewards changent
  useEffect(() => {
    drawWheel(rotationRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewards]);

  // Démarre / arrête l'animation
  useEffect(() => {
    if (spinning && !startTimeRef.current) {
      const extra = Math.random() * Math.PI * 2;
      targetRotation.current = rotationRef.current + Math.PI * 2 * 5 + extra;
      startTimeRef.current = performance.now();
      animate();
    }
    if (!spinning) {
      startTimeRef.current = 0;
      cancelAnimationFrame(animationRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning]);

  function easeOut(t: number) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animate() {
    const DURATION = 3500;
    const elapsed = performance.now() - startTimeRef.current;
    const progress = Math.min(elapsed / DURATION, 1);
    const rot = rotationRef.current + (targetRotation.current - rotationRef.current) * easeOut(progress);

    rotationRef.current = rot % (Math.PI * 2);
    drawWheel(rot);
    setTick((t) => t + 1); // force re-render pour le pointeur si nécessaire

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }

  if (rewards.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
        Aucune récompense configurée
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {/* Pointeur */}
      <div
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2"
        style={{ color: primaryColor }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 12 L4 6 L4 18 Z" />
        </svg>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-full shadow-2xl"
        // width/height fixés dynamiquement dans useEffect
      />
    </div>
  );
}
