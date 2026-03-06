import { type Particle, type FloatingText, SCENE, COLORS } from "./types";

export function drawStars(
  ctx: CanvasRenderingContext2D,
  rating: number,
  reviewCount: number,
  time: number
) {
  const cx = SCENE.SHOP_X + SCENE.SHOP_W / 2;
  const cy = SCENE.STAR_Y;
  const starSize = 16;
  const gap = 38;
  const startX = cx - 2 * gap;

  // Background pill
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  const pillW = 220;
  const pillH = 44;
  ctx.moveTo(cx - pillW / 2 + pillH / 2, cy - pillH / 2);
  ctx.lineTo(cx + pillW / 2 - pillH / 2, cy - pillH / 2);
  ctx.arc(cx + pillW / 2 - pillH / 2, cy, pillH / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(cx - pillW / 2 + pillH / 2, cy + pillH / 2);
  ctx.arc(cx - pillW / 2 + pillH / 2, cy, pillH / 2, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#E5E7EB";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Stars
  for (let i = 0; i < 5; i++) {
    const sx = startX + i * gap;
    const fillAmount = Math.max(0, Math.min(1, rating - i));

    // Empty star
    drawStar(ctx, sx, cy, starSize, COLORS.starEmpty);

    // Filled portion (clip)
    if (fillAmount > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx - starSize, cy - starSize, starSize * 2 * fillAmount, starSize * 2);
      ctx.clip();
      drawStar(ctx, sx, cy, starSize, COLORS.starFull);

      // Sparkle on recently filled stars
      if (fillAmount > 0.8) {
        const sparkle = 0.3 + 0.3 * Math.sin(time * 4 + i);
        ctx.globalAlpha = sparkle;
        drawStar(ctx, sx, cy, starSize + 3, COLORS.starGlow);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
  }

  // Rating number
  ctx.fillStyle = "#1E293B";
  ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(rating.toFixed(1), cx, cy + 34);

  // Review count
  if (reviewCount > 0) {
    ctx.fillStyle = "#64748B";
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`(${reviewCount} avis)`, cx, cy + 48);
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, size: number, color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? size : size * 0.45;
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
    const alpha = p.life / p.maxLife;
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
    const alpha = t.life / t.maxLife;
    const rise = (1 - t.life / t.maxLife) * 40;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.font = `bold ${t.fontSize}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = "center";
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

  const alpha = (prosperity - 0.7) / 0.3;
  ctx.globalAlpha = alpha * 0.6;

  const icons = ["\u2B50", "\uD83D\uDCC5", "\uD83C\uDFAF", "\uD83D\uDCB3"];
  const cx = SCENE.SHOP_X + SCENE.SHOP_W / 2;

  for (let i = 0; i < icons.length; i++) {
    const angle = time * 0.5 + (i / icons.length) * Math.PI * 2;
    const radius = 160 + Math.sin(time + i) * 20;
    const ix = cx + Math.cos(angle) * radius;
    const iy = SCENE.SHOP_TOP - 40 + Math.sin(angle) * 40 - 20;
    ctx.font = "22px serif";
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
  const alpha = (prosperity - 0.8) / 0.2 * 0.15;

  const nodes: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 12; i++) {
    nodes.push({
      x: 100 + Math.sin(time * 0.3 + i * 1.7) * 50 + (i % 4) * 350,
      y: 60 + Math.cos(time * 0.4 + i * 2.1) * 30 + Math.floor(i / 4) * 120,
    });
  }

  ctx.strokeStyle = `rgba(129,140,248,${alpha})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
      if (dist < 350) {
        ctx.globalAlpha = alpha * (1 - dist / 350);
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  ctx.fillStyle = `rgba(129,140,248,${alpha * 2})`;
  for (const n of nodes) {
    ctx.globalAlpha = alpha * 2;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
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

  const alpha = progress < 0.8 ? 1 : 1 - (progress - 0.8) / 0.2;
  ctx.globalAlpha = alpha;

  const radius = 24;
  const rY = y - 70 - progress * 20;

  // Wheel
  const segments = 6;
  const segColors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];
  const spinAngle = time * 12 * (1 - progress * 0.8);

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

  // Border
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, rY, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(x, rY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Result emoji (coffee) at end
  if (progress > 0.7) {
    ctx.font = "18px serif";
    ctx.textAlign = "center";
    ctx.globalAlpha = alpha * ((progress - 0.7) / 0.3);
    ctx.fillText("\u2615", x, rY - radius - 10);
  }

  ctx.globalAlpha = 1;
}
