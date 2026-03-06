import { type Particle, type FloatingText, SCENE, COLORS } from "./types";

export function drawStars(
  ctx: CanvasRenderingContext2D,
  rating: number,
  reviewCount: number,
  time: number
) {
  const cx = SCENE.SHOP_X + SCENE.SHOP_W / 2;
  const cy = SCENE.STAR_Y;
  const starSize = 14;
  const gap = 34;
  const startX = cx - 2 * gap;

  // Background pill with subtle shadow
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  drawPill(ctx, cx, cy + 2, 200, 38);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  drawPill(ctx, cx, cy, 200, 38);
  ctx.fill();
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  drawPill(ctx, cx, cy, 200, 38);
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const sx = startX + i * gap;
    const fillAmount = Math.max(0, Math.min(1, rating - i));

    drawStar(ctx, sx, cy, starSize, COLORS.starEmpty);

    if (fillAmount > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx - starSize, cy - starSize, starSize * 2 * fillAmount, starSize * 2);
      ctx.clip();
      drawStar(ctx, sx, cy, starSize, COLORS.starFull);

      if (fillAmount > 0.8) {
        const sparkle = 0.15 + 0.15 * Math.sin(time * 3 + i);
        ctx.globalAlpha = sparkle;
        drawStar(ctx, sx, cy, starSize + 2, COLORS.starGlow);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  }

  // Rating text
  ctx.fillStyle = "#1E293B";
  ctx.font = "600 12px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(rating.toFixed(1), cx, cy + 30);

  if (reviewCount > 0) {
    ctx.fillStyle = "#94A3B8";
    ctx.font = "400 10px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`(${reviewCount} avis)`, cx, cy + 43);
  }
}

function drawPill(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2 + r, cy - r);
  ctx.lineTo(cx + w / 2 - r, cy - r);
  ctx.arc(cx + w / 2 - r, cy, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(cx - w / 2 + r, cy + r);
  ctx.arc(cx - w / 2 + r, cy, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.42;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = (p.life / p.maxLife) * 0.7;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  for (const t of texts) {
    const progress = 1 - t.life / t.maxLife;
    const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
    const rise = progress * 35;

    ctx.globalAlpha = alpha * 0.9;

    // Text shadow
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `600 ${t.fontSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(t.text, t.x + 1, t.y - rise + 1);

    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y - rise);
  }
  ctx.globalAlpha = 1;
}

export function drawFloatingIcons(
  ctx: CanvasRenderingContext2D,
  prosperity: number,
  time: number
) {
  if (prosperity < 0.7) return;

  const alpha = (prosperity - 0.7) / 0.3 * 0.4;
  ctx.globalAlpha = alpha;

  const icons = ["\u2B50", "\uD83D\uDCC5", "\uD83C\uDFAF", "\uD83D\uDCB3"];
  const cx = SCENE.SHOP_X + SCENE.SHOP_W / 2;

  for (let i = 0; i < icons.length; i++) {
    const angle = time * 0.4 + (i / icons.length) * Math.PI * 2;
    const radius = 140 + Math.sin(time * 0.8 + i) * 15;
    const ix = cx + Math.cos(angle) * radius;
    const iy = SCENE.SHOP_TOP - 30 + Math.sin(angle) * 30 - 15;
    ctx.font = "18px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(icons[i], ix, iy);
  }

  ctx.globalAlpha = 1;
}

export function drawConstellationNetwork(
  ctx: CanvasRenderingContext2D,
  prosperity: number,
  time: number
) {
  if (prosperity < 0.8) return;
  const alpha = (prosperity - 0.8) / 0.2 * 0.08;

  const nodes: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 10; i++) {
    nodes.push({
      x: 100 + Math.sin(time * 0.2 + i * 1.7) * 40 + (i % 4) * 350,
      y: 50 + Math.cos(time * 0.3 + i * 2.1) * 25 + Math.floor(i / 4) * 130,
    });
  }

  ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 300) {
        ctx.globalAlpha = alpha * (1 - dist / 300);
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  for (const n of nodes) {
    ctx.globalAlpha = alpha * 2.5;
    ctx.fillStyle = `rgba(99,102,241,1)`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawRoulette(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  progress: number,
  time: number
) {
  if (progress <= 0 || progress > 1) return;

  const alpha = progress < 0.8 ? 0.9 : 0.9 * (1 - (progress - 0.8) / 0.2);
  ctx.globalAlpha = alpha;

  const radius = 20;
  const rY = y - 60 - progress * 15;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath();
  ctx.arc(x + 1, rY + 1, radius + 2, 0, Math.PI * 2);
  ctx.fill();

  // Wheel segments
  const segments = 6;
  const segColors = ["#4F46E5", "#F59E0B", "#10B981", "#6366F1", "#8B5CF6", "#0EA5E9"];
  const spinSpeed = 10 * (1 - progress * 0.85);
  const spinAngle = time * spinSpeed;

  for (let i = 0; i < segments; i++) {
    const startAngle = spinAngle + (i / segments) * Math.PI * 2;
    const endAngle = spinAngle + ((i + 1) / segments) * Math.PI * 2;
    ctx.fillStyle = segColors[i];
    ctx.beginPath();
    ctx.moveTo(x, rY);
    ctx.arc(x, rY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
  }

  // Outer ring
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, rY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Center
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x, rY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Pointer triangle at top
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(x, rY - radius - 4);
  ctx.lineTo(x - 4, rY - radius + 2);
  ctx.lineTo(x + 4, rY - radius + 2);
  ctx.closePath();
  ctx.fill();

  // Result at end
  if (progress > 0.75) {
    const resultAlpha = (progress - 0.75) / 0.25;
    ctx.globalAlpha = alpha * resultAlpha;
    ctx.font = "16px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("\u2615", x, rY - radius - 10);
  }

  ctx.globalAlpha = 1;
}
