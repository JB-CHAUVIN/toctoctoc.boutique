import { type Character, SCENE } from "./types";

export function drawCharacter(ctx: CanvasRenderingContext2D, char: Character, time: number) {
  const { x, y, direction, scale, skinColor, shirtColor, pantsColor, state, stateTime, hasPhone } = char;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction * scale, scale);

  const walkBob = state === "walking" ? Math.sin(time * 8) * 2 : 0;
  const legSwing = state === "walking" ? Math.sin(time * 8) * 15 : 0;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs (tapered)
  drawLeg(ctx, -5, -14, legSwing, pantsColor);
  drawLeg(ctx, 5, -14, -legSwing, pantsColor);

  // Body (torso — tapered shape)
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  ctx.moveTo(-10, -44 + walkBob);
  ctx.quadraticCurveTo(-12, -28 + walkBob, -8, -14);
  ctx.lineTo(8, -14);
  ctx.quadraticCurveTo(12, -28 + walkBob, 10, -44 + walkBob);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = skinColor;
  ctx.fillRect(-3, -48 + walkBob, 6, 6);

  // Head (slightly oval)
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.ellipse(0, -55 + walkBob, 10, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = darken(skinColor, 40);
  ctx.beginPath();
  ctx.ellipse(0, -60 + walkBob, 10, 7, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Arms
  const armY = -38 + walkBob;
  if (hasPhone && (state === "scanning" || state === "celebrating")) {
    // One arm holding phone up
    drawArm(ctx, -10, armY, -18, armY + 14, shirtColor, skinColor);
    drawPhoneArm(ctx, 10, armY, state, stateTime, time, shirtColor, skinColor);
  } else {
    const swing = state === "walking" ? Math.sin(time * 8) * 10 : 0;
    drawArm(ctx, -10, armY, -16 - swing * 0.3, armY + 18 + Math.abs(swing) * 0.3, shirtColor, skinColor);
    drawArm(ctx, 10, armY, 16 + swing * 0.3, armY + 18 + Math.abs(swing) * 0.3, shirtColor, skinColor);
  }

  // Celebration sparkles
  if (state === "celebrating") {
    const progress = Math.min(stateTime / 1.5, 1);
    ctx.globalAlpha = 0.6 * (1 - progress);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + time * 2;
      const dist = 18 + progress * 25;
      drawSparkle(ctx, Math.cos(angle) * dist, -45 + Math.sin(angle) * dist - progress * 15, 3);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawLeg(ctx: CanvasRenderingContext2D, baseX: number, baseY: number, swing: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + swing * 0.25, baseY + 14);
  ctx.stroke();
  // Shoe
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.ellipse(baseX + swing * 0.25, baseY + 15, 4, 2.5, swing * 0.02, 0, Math.PI * 2);
  ctx.fill();
}

function drawArm(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, ex: number, ey: number,
  shirtColor: string, skinColor: string
) {
  ctx.strokeStyle = shirtColor;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  // Hand
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(ex, ey, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawPhoneArm(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number,
  state: string, stateTime: number, time: number,
  shirtColor: string, skinColor: string
) {
  const raised = state === "scanning" ? Math.min(stateTime / 0.5, 1) : 1;
  const ex = sx + 8;
  const ey = sy - 10 * raised;

  drawArm(ctx, sx, sy, ex, ey, shirtColor, skinColor);

  // Phone
  ctx.fillStyle = "#0F172A";
  const phoneW = 6;
  const phoneH = 11;
  ctx.save();
  ctx.translate(ex + 2, ey - phoneH / 2);
  ctx.rotate(-0.2 * raised);
  roundRect(ctx, -phoneW / 2, -phoneH / 2, phoneW, phoneH, 2);
  ctx.fill();
  // Screen glow
  ctx.fillStyle = "#818CF8";
  ctx.globalAlpha = 0.8;
  ctx.fillRect(-phoneW / 2 + 1, -phoneH / 2 + 1.5, phoneW - 2, phoneH - 3);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Scan beam
  if (state === "scanning" && stateTime > 0.3 && stateTime < 1.8) {
    const beamAlpha = 0.15 + 0.1 * Math.sin(time * 8);
    ctx.strokeStyle = `rgba(129,140,248,${beamAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ex + 4, ey);
    ctx.lineTo(ex - 30, ey + 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scan glow at target
    const glow = ctx.createRadialGradient(ex - 32, ey + 27, 0, ex - 32, ey + 27, 12);
    glow.addColorStop(0, `rgba(129,140,248,${beamAlpha * 1.5})`);
    glow.addColorStop(1, "rgba(129,140,248,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(ex - 44, ey + 15, 24, 24);
  }
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.fillStyle = "#FDE68A";
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.3, y - size * 0.3);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.3, y + size * 0.3);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x - size * 0.3, y - size * 0.3);
  ctx.closePath();
  ctx.fill();
}

export function drawMerchant(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  mood: number, time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const idle = Math.sin(time * 1.5) * 1.5;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.strokeStyle = "#1E293B";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-6, -14);
  ctx.lineTo(-6, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -14);
  ctx.lineTo(6, 0);
  ctx.stroke();

  // Shoes
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.ellipse(-6, 1, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, 1, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (torso)
  ctx.fillStyle = "#4F46E5";
  ctx.beginPath();
  ctx.moveTo(-12, -48 + idle);
  ctx.quadraticCurveTo(-14, -30 + idle, -9, -14);
  ctx.lineTo(9, -14);
  ctx.quadraticCurveTo(14, -30 + idle, 12, -48 + idle);
  ctx.closePath();
  ctx.fill();

  // Apron
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(-8, -32 + idle);
  ctx.lineTo(8, -32 + idle);
  ctx.lineTo(9, -14);
  ctx.lineTo(-9, -14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Apron strap
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-4, -32 + idle);
  ctx.lineTo(-2, -44 + idle);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, -32 + idle);
  ctx.lineTo(2, -44 + idle);
  ctx.stroke();

  // Neck
  ctx.fillStyle = "#F5D0B0";
  ctx.fillRect(-3, -52 + idle, 6, 6);

  // Head
  ctx.fillStyle = "#F5D0B0";
  ctx.beginPath();
  ctx.ellipse(0, -59 + idle, 11, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.ellipse(0, -65 + idle, 11, 7, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.arc(-4, -60 + idle, 1.5, 0, Math.PI * 2);
  ctx.arc(4, -60 + idle, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Mouth — mood-dependent
  ctx.strokeStyle = "#78716C";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  if (mood > 0.5) {
    ctx.arc(0, -54 + idle, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  } else {
    ctx.moveTo(-3, -54 + idle);
    ctx.lineTo(3, -54 + idle);
  }
  ctx.stroke();

  // Arms
  if (mood > 0.7) {
    const wave = Math.sin(time * 2.5) * 0.15;
    drawMerchantArm(ctx, -12, -42 + idle, -22, -50 + idle + Math.sin(time * 2.5 + wave) * 4, "#4F46E5", "#F5D0B0");
    drawMerchantArm(ctx, 12, -42 + idle, 22, -50 + idle + Math.sin(time * 2.5 + 1 + wave) * 4, "#4F46E5", "#F5D0B0");
  } else {
    drawMerchantArm(ctx, -12, -40 + idle, -6, -28 + idle, "#4F46E5", "#F5D0B0");
    drawMerchantArm(ctx, 12, -40 + idle, 6, -28 + idle, "#4F46E5", "#F5D0B0");
  }

  ctx.restore();
}

function drawMerchantArm(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, ex: number, ey: number,
  sleeveColor: string, skinColor: string
) {
  ctx.strokeStyle = sleeveColor;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(ex, ey, 3, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r},${g},${b})`;
}
