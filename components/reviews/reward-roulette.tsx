"use client";

import { useRef, useEffect, useState } from "react";
import type { Reward } from "@prisma/client";

interface Props {
  rewards: Reward[];
  spinning: boolean;
  primaryColor: string;
}

export function RewardRoulette({ rewards, spinning, primaryColor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const targetRotation = useRef<number>(0);

  const SIZE = 280;
  const CENTER = SIZE / 2;
  const RADIUS = CENTER - 10;

  useEffect(() => {
    drawWheel(rotation);
  }, [rewards, rotation]);

  useEffect(() => {
    if (spinning && !startTimeRef.current) {
      // 3 tours complets + position aléatoire
      const extra = Math.random() * Math.PI * 2;
      targetRotation.current = rotation + Math.PI * 2 * 5 + extra;
      startTimeRef.current = performance.now();
      animate();
    }

    if (!spinning) {
      startTimeRef.current = 0;
      cancelAnimationFrame(animationRef.current);
    }
  }, [spinning]);

  function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 4);
  }

  function animate() {
    const DURATION = 3500;
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const progress = Math.min(elapsed / DURATION, 1);
    const easedProgress = easeOut(progress);

    const currentRotation = rotation + (targetRotation.current - rotation) * easedProgress;
    setRotation(currentRotation % (Math.PI * 2));
    drawWheel(currentRotation);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }

  function drawWheel(rot: number) {
    const canvas = canvasRef.current;
    if (!canvas || rewards.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, SIZE, SIZE);

    const totalProb = rewards.reduce((sum, r) => sum + r.probability, 0);
    let startAngle = rot;

    rewards.forEach((reward, i) => {
      const angle = (reward.probability / totalProb) * Math.PI * 2;

      // Segment
      ctx.beginPath();
      ctx.moveTo(CENTER, CENTER);
      ctx.arc(CENTER, CENTER, RADIUS, startAngle, startAngle + angle);
      ctx.closePath();
      ctx.fillStyle = reward.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      const textAngle = startAngle + angle / 2;
      const textRadius = RADIUS * 0.65;
      const x = CENTER + Math.cos(textAngle) * textRadius;
      const y = CENTER + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Emoji + texte tronqué
      const label = reward.emoji + " " + (reward.name.length > 12 ? reward.name.slice(0, 10) + "…" : reward.name);
      ctx.fillText(label, 0, 0);
      ctx.restore();

      startAngle += angle;
    });

    // Centre blanc
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (rewards.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-slate-400 text-sm">
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
        width={SIZE}
        height={SIZE}
        className="rounded-full shadow-2xl"
        style={{ transform: `rotate(0deg)` }}
      />
    </div>
  );
}
