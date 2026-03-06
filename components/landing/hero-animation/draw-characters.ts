import { type Character, SCENE } from "./types";
import { roundRect } from "./draw-scene";

export function drawCharacter(ctx: CanvasRenderingContext2D, char: Character, time: number) {
  const { x, y, direction, scale, headColor, bodyColor, state, stateTime, hasPhone } = char;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction * scale, scale);

  const walkBob = state === "walking" ? Math.sin(time * 8) * 3 : 0;
  const legSwing = state === "walking" ? Math.sin(time * 8) * 12 : 0;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-5, -12);
  ctx.lineTo(-5 - legSwing * 0.3, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(5, -12);
  ctx.lineTo(5 + legSwing * 0.3, 0);
  ctx.stroke();

  // Body
  ctx.fillStyle = bodyColor;
  roundRect(ctx, -12, -42 + walkBob, 24, 32, 6);
  ctx.fill();

  // Head
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(0, -52 + walkBob, 12, 0, Math.PI * 2);
  ctx.fill();

  // Face expression
  drawFace(ctx, 0, -52 + walkBob, state);

  // Phone in hand (when scanning or celebrating)
  if (hasPhone && (state === "scanning" || state === "celebrating")) {
    drawPhone(ctx, state, stateTime, time);
  }

  // Celebration effect
  if (state === "celebrating") {
    const celebProgress = Math.min(stateTime / 1.5, 1);
    ctx.globalAlpha = 1 - celebProgress;
    ctx.fillStyle = "#FDE68A";
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time * 3;
      const dist = 20 + celebProgress * 30;
      ctx.beginPath();
      ctx.arc(
        Math.cos(angle) * dist,
        -40 + Math.sin(angle) * dist - celebProgress * 20,
        3, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawFace(ctx: CanvasRenderingContext2D, x: number, y: number, state: string) {
  ctx.fillStyle = "#1E1B4B";
  // Eyes
  ctx.beginPath();
  ctx.arc(x - 4, y - 2, 1.5, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 2, 1.5, 0, Math.PI * 2);
  ctx.fill();
  // Mouth
  if (state === "celebrating" || state === "idle") {
    ctx.strokeStyle = "#1E1B4B";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y + 2, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
}

function drawPhone(
  ctx: CanvasRenderingContext2D,
  state: string, stateTime: number, time: number
) {
  const phoneAngle = state === "scanning" ? -0.8 : -0.3;
  const phoneX = 16;
  const phoneY = -38;

  ctx.save();
  ctx.translate(phoneX, phoneY);
  ctx.rotate(phoneAngle);

  // Phone body
  ctx.fillStyle = "#1E293B";
  roundRect(ctx, -6, -10, 12, 20, 3);
  ctx.fill();
  // Screen
  ctx.fillStyle = "#60A5FA";
  ctx.fillRect(-4, -7, 8, 14);

  // Scan beam
  if (state === "scanning" && stateTime < 1.5) {
    ctx.restore();
    const beamAlpha = 0.3 + 0.2 * Math.sin(time * 10);
    ctx.strokeStyle = `rgba(96,165,250,${beamAlpha})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const beamStartX = phoneX + 8;
    const beamStartY = phoneY - 5;
    ctx.moveTo(beamStartX, beamStartY);
    ctx.lineTo(beamStartX - 40, beamStartY + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scan glow at QR
    const glowAlpha = 0.4 + 0.2 * Math.sin(time * 12);
    ctx.fillStyle = `rgba(96,165,250,${glowAlpha})`;
    ctx.beginPath();
    ctx.arc(beamStartX - 42, beamStartY + 22, 15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.restore();
  }
}

export function drawMerchant(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  mood: number, time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const idle = Math.sin(time * 1.5) * 2;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.strokeStyle = "#1E3A5F";
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

  // Body
  ctx.fillStyle = "#4F46E5";
  roundRect(ctx, -14, -48 + idle, 28, 36, 7);
  ctx.fill();

  // Apron
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, -10, -32 + idle, 20, 20, 4);
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  roundRect(ctx, -10, -32 + idle, 20, 20, 4);
  ctx.stroke();

  // Head
  ctx.fillStyle = "#FBBF24";
  ctx.beginPath();
  ctx.arc(0, -58 + idle, 14, 0, Math.PI * 2);
  ctx.fill();

  // Face — mood-dependent
  ctx.fillStyle = "#1E1B4B";
  ctx.beginPath();
  ctx.arc(-5, -60 + idle, 2, 0, Math.PI * 2);
  ctx.arc(5, -60 + idle, 2, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = "#1E1B4B";
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (mood > 0.5) {
    // Happy smile
    ctx.arc(0, -53 + idle, 6, 0.1 * Math.PI, 0.9 * Math.PI);
  } else {
    // Neutral/slightly sad
    ctx.arc(0, -50 + idle, 5, 1.1 * Math.PI, 1.9 * Math.PI);
  }
  ctx.stroke();

  // Arms
  ctx.strokeStyle = "#4F46E5";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  if (mood > 0.7) {
    // Welcoming gesture
    const wave = Math.sin(time * 3) * 0.2;
    ctx.beginPath();
    ctx.moveTo(-14, -40 + idle);
    ctx.lineTo(-24, -48 + idle + Math.sin(time * 3 + wave) * 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, -40 + idle);
    ctx.lineTo(24, -48 + idle + Math.sin(time * 3 + 1 + wave) * 5);
    ctx.stroke();
  } else {
    // Arms crossed
    ctx.beginPath();
    ctx.moveTo(-14, -38 + idle);
    ctx.lineTo(-8, -30 + idle);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, -38 + idle);
    ctx.lineTo(8, -30 + idle);
    ctx.stroke();
  }

  ctx.restore();
}
