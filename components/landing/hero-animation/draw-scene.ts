import { SCENE, COLORS } from "./types";

export function drawSky(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, SCENE.GROUND_Y);
  grad.addColorStop(0, COLORS.sky1);
  grad.addColorStop(1, COLORS.sky2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCENE.W, SCENE.GROUND_Y);
}

export function drawGridPattern(ctx: CanvasRenderingContext2D, time: number) {
  ctx.fillStyle = COLORS.gridDot;
  const spacing = 40;
  const offset = (time * 3) % spacing;
  for (let x = -spacing + offset; x < SCENE.W + spacing; x += spacing) {
    for (let y = 0; y < SCENE.GROUND_Y; y += spacing) {
      ctx.globalAlpha = 0.3 + 0.1 * Math.sin(x * 0.01 + y * 0.01 + time);
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawGround(ctx: CanvasRenderingContext2D) {
  // Sidewalk
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(0, SCENE.GROUND_Y, SCENE.W, 30);
  // Road
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, SCENE.GROUND_Y + 30, SCENE.W, SCENE.H - SCENE.GROUND_Y - 30);
  // Curb line
  ctx.strokeStyle = "#94A3B8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, SCENE.GROUND_Y + 30);
  ctx.lineTo(SCENE.W, SCENE.GROUND_Y + 30);
  ctx.stroke();
}

export function drawBackgroundBuildings(ctx: CanvasRenderingContext2D, time: number) {
  const buildings = [
    { x: 40, w: 120, h: 180, color: "#E2E8F0" },
    { x: 180, w: 100, h: 140, color: "#F1F5F9" },
    { x: 300, w: 130, h: 200, color: "#E2E8F0" },
    { x: 950, w: 110, h: 160, color: "#F1F5F9" },
    { x: 1080, w: 140, h: 190, color: "#E2E8F0" },
    { x: 1240, w: 120, h: 150, color: "#F1F5F9" },
  ];
  for (const b of buildings) {
    const parallax = Math.sin(time * 0.2) * 2;
    ctx.fillStyle = b.color;
    roundRect(ctx, b.x + parallax, SCENE.GROUND_Y - b.h, b.w, b.h, 4);
    ctx.fill();
    // windows
    ctx.fillStyle = "#CBD5E1";
    const winW = 14;
    const winH = 18;
    const cols = Math.floor((b.w - 20) / 24);
    const rows = Math.floor((b.h - 30) / 30);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = b.x + parallax + 12 + c * 24;
        const wy = SCENE.GROUND_Y - b.h + 20 + r * 30;
        ctx.fillRect(wx, wy, winW, winH);
      }
    }
  }
}

export function drawShop(
  ctx: CanvasRenderingContext2D,
  glow: number,
  time: number,
  prosperity: number
) {
  const sx = SCENE.SHOP_X;
  const sw = SCENE.SHOP_W;
  const st = SCENE.SHOP_TOP;
  const sh = SCENE.GROUND_Y - st;

  // Glow behind shop
  if (glow > 0) {
    const glowGrad = ctx.createRadialGradient(
      sx + sw / 2, st + sh / 2, 30,
      sx + sw / 2, st + sh / 2, sw * 0.8
    );
    glowGrad.addColorStop(0, `rgba(99,102,241,${0.15 * glow})`);
    glowGrad.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sx - 100, st - 80, sw + 200, sh + 100);
  }

  // Main building
  const wallColor = prosperity > 0.5 ? COLORS.shopWallLit : COLORS.shopWall;
  ctx.fillStyle = wallColor;
  roundRect(ctx, sx, st, sw, sh, 6);
  ctx.fill();
  ctx.strokeStyle = "#A5B4FC";
  ctx.lineWidth = 2;
  roundRect(ctx, sx, st, sw, sh, 6);
  ctx.stroke();

  // Awning
  drawAwning(ctx, sx - 8, st - 5, sw + 16, 32, time);

  // Sign
  ctx.fillStyle = COLORS.sign;
  roundRect(ctx, sx + sw / 2 - 72, st + 8, 144, 26, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.signText;
  ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MON COMMERCE", sx + sw / 2, st + 26);

  // Windows
  drawWindow(ctx, sx + 24, st + 48, 56, 44);
  drawWindow(ctx, sx + sw - 80, st + 48, 56, 44);

  // Door
  const doorW = 48;
  const doorH = 80;
  const doorX = sx + sw / 2 - doorW / 2;
  const doorY = SCENE.GROUND_Y - doorH;
  const doorColor = prosperity > 0.3 ? COLORS.doorLight : COLORS.door;
  ctx.fillStyle = doorColor;
  roundRect(ctx, doorX, doorY, doorW, doorH, [8, 8, 0, 0]);
  ctx.fill();
  // Door handle
  ctx.fillStyle = "#FDE68A";
  ctx.beginPath();
  ctx.arc(doorX + doorW - 12, doorY + doorH / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  // Light from door
  if (prosperity > 0.3) {
    ctx.fillStyle = `rgba(253,230,138,${0.2 * prosperity})`;
    ctx.beginPath();
    ctx.moveTo(doorX, doorY + doorH);
    ctx.lineTo(doorX - 20, SCENE.GROUND_Y + 10);
    ctx.lineTo(doorX + doorW + 20, SCENE.GROUND_Y + 10);
    ctx.lineTo(doorX + doorW, doorY + doorH);
    ctx.closePath();
    ctx.fill();
  }

  // Plants (appear with prosperity)
  if (prosperity > 0.5) {
    drawPlant(ctx, sx + 10, SCENE.GROUND_Y, prosperity);
    drawPlant(ctx, sx + sw - 25, SCENE.GROUND_Y, prosperity);
  }
}

function drawAwning(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, time: number
) {
  const segments = 8;
  const segW = w / segments;
  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.awning : COLORS.awningStripe;
    const wave = Math.sin(time * 1.5 + i * 0.5) * 2;
    ctx.beginPath();
    ctx.moveTo(x + i * segW, y);
    ctx.lineTo(x + (i + 1) * segW, y);
    ctx.lineTo(x + (i + 1) * segW, y + h + wave);
    ctx.quadraticCurveTo(
      x + i * segW + segW / 2, y + h + 8 + wave,
      x + i * segW, y + h + wave
    );
    ctx.closePath();
    ctx.fill();
  }
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = COLORS.window;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.strokeStyle = COLORS.windowFrame;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 4);
  ctx.stroke();
  // Cross bars
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, groundY: number, alpha: number) {
  ctx.globalAlpha = alpha;
  // Pot
  ctx.fillStyle = "#92400E";
  roundRect(ctx, x, groundY - 20, 16, 20, 3);
  ctx.fill();
  // Leaves
  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.arc(x + 8, groundY - 28, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 2, groundY - 24, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 14, groundY - 24, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawQRStand(ctx: CanvasRenderingContext2D) {
  const x = SCENE.QR_X;
  const y = SCENE.QR_Y;
  // Stand pole
  ctx.fillStyle = "#94A3B8";
  ctx.fillRect(x + 8, y, 4, 50);
  // Base
  ctx.fillStyle = "#64748B";
  roundRect(ctx, x, y + 46, 20, 6, 3);
  ctx.fill();
  // QR card
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, x - 2, y - 22, 24, 24, 3);
  ctx.fill();
  ctx.strokeStyle = "#4F46E5";
  ctx.lineWidth = 1.5;
  roundRect(ctx, x - 2, y - 22, 24, 24, 3);
  ctx.stroke();
  // QR pattern (simple)
  ctx.fillStyle = "#1E1B4B";
  const qs = 3;
  const qx = x + 2;
  const qy = y - 18;
  const pattern = [
    [1,1,1,0,1,1],
    [1,0,1,0,0,1],
    [1,1,1,0,1,0],
    [0,0,0,1,0,1],
    [1,0,1,1,1,1],
    [1,0,0,1,0,1],
  ];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      if (pattern[r][c]) ctx.fillRect(qx + c * qs, qy + r * qs, qs, qs);
    }
  }
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number | number[]
) {
  const radii = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + radii[0], y);
  ctx.lineTo(x + w - radii[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radii[1]);
  ctx.lineTo(x + w, y + h - radii[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radii[2], y + h);
  ctx.lineTo(x + radii[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radii[3]);
  ctx.lineTo(x, y + radii[0]);
  ctx.quadraticCurveTo(x, y, x + radii[0], y);
  ctx.closePath();
}
