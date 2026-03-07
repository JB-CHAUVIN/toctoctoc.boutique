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
  const spacing = 50;
  const offset = (time * 2) % spacing;
  for (let x = -spacing + offset; x < SCENE.W + spacing; x += spacing) {
    for (let y = 0; y < SCENE.GROUND_Y; y += spacing) {
      ctx.globalAlpha = 0.15 + 0.05 * Math.sin(x * 0.008 + y * 0.008 + time * 0.5);
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export function drawGround(ctx: CanvasRenderingContext2D) {
  // Sidewalk
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(0, SCENE.GROUND_Y, SCENE.W, 25);
  // Road
  const roadGrad = ctx.createLinearGradient(0, SCENE.GROUND_Y + 25, 0, SCENE.H);
  roadGrad.addColorStop(0, COLORS.ground);
  roadGrad.addColorStop(1, "#CBD5E1");
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, SCENE.GROUND_Y + 25, SCENE.W, SCENE.H - SCENE.GROUND_Y - 25);
  // Subtle curb line
  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, SCENE.GROUND_Y + 25);
  ctx.lineTo(SCENE.W, SCENE.GROUND_Y + 25);
  ctx.stroke();
}

export function drawBackgroundBuildings(ctx: CanvasRenderingContext2D, time: number) {
  const buildings = [
    { x: 50, w: 110, h: 170, color: "#F1F5F9", accent: "#E2E8F0" },
    { x: 180, w: 90, h: 130, color: "#F8FAFC", accent: "#E2E8F0" },
    { x: 290, w: 120, h: 190, color: "#F1F5F9", accent: "#E2E8F0" },
    { x: 940, w: 100, h: 150, color: "#F8FAFC", accent: "#E2E8F0" },
    { x: 1060, w: 130, h: 180, color: "#F1F5F9", accent: "#E2E8F0" },
    { x: 1210, w: 110, h: 140, color: "#F8FAFC", accent: "#E2E8F0" },
  ];
  const parallax = Math.sin(time * 0.15) * 1.5;

  for (const b of buildings) {
    const bx = b.x + parallax;
    const by = SCENE.GROUND_Y - b.h;

    // Building body
    ctx.fillStyle = b.color;
    ctx.fillRect(bx, by, b.w, b.h);

    // Subtle border
    ctx.strokeStyle = b.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, b.w, b.h);

    // Windows (subtle grid)
    ctx.fillStyle = b.accent;
    const winW = 10;
    const winH = 14;
    const colGap = 20;
    const rowGap = 24;
    const cols = Math.floor((b.w - 16) / colGap);
    const rows = Math.floor((b.h - 20) / rowGap);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(bx + 10 + c * colGap, by + 16 + r * rowGap, winW, winH);
      }
    }
  }
}

export function drawShop(
  ctx: CanvasRenderingContext2D,
  glow: number,
  time: number,
  prosperity: number,
  shopName?: string,
) {
  const sx = SCENE.SHOP_X;
  const sw = SCENE.SHOP_W;
  const st = SCENE.SHOP_TOP;
  const sh = SCENE.GROUND_Y - st;

  // Glow behind shop
  if (glow > 0) {
    const glowGrad = ctx.createRadialGradient(
      sx + sw / 2, st + sh / 2, 20,
      sx + sw / 2, st + sh / 2, sw
    );
    glowGrad.addColorStop(0, `rgba(79,70,229,${0.08 * glow})`);
    glowGrad.addColorStop(1, "rgba(79,70,229,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sx - 120, st - 60, sw + 240, sh + 80);
  }

  // Building shadow
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  roundRect(ctx, sx + 4, st + 4, sw, sh, 4);
  ctx.fill();

  // Main building
  const wallGrad = ctx.createLinearGradient(sx, st, sx, st + sh);
  wallGrad.addColorStop(0, prosperity > 0.5 ? COLORS.shopWallLit : COLORS.shopWall);
  wallGrad.addColorStop(1, "#F5F5F4");
  ctx.fillStyle = wallGrad;
  roundRect(ctx, sx, st, sw, sh, 4);
  ctx.fill();
  ctx.strokeStyle = "#D6D3D1";
  ctx.lineWidth = 1;
  roundRect(ctx, sx, st, sw, sh, 4);
  ctx.stroke();

  // Awning
  drawAwning(ctx, sx - 6, st - 4, sw + 12, 28, time);

  // Sign
  ctx.fillStyle = COLORS.sign;
  const signW = 130;
  const signH = 22;
  roundRect(ctx, sx + sw / 2 - signW / 2, st + 8, signW, signH, 4);
  ctx.fill();
  ctx.fillStyle = COLORS.signText;
  const displayName = (shopName ?? "MON COMMERCE").toUpperCase();
  const fontSize = displayName.length > 16 ? 7 : displayName.length > 12 ? 8.5 : 10;
  ctx.font = `600 ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(displayName, sx + sw / 2, st + 22, signW - 10);

  // Windows
  drawWindow(ctx, sx + 20, st + 42, 50, 38);
  drawWindow(ctx, sx + sw - 70, st + 42, 50, 38);

  // Door
  const doorW = 40;
  const doorH = 68;
  const doorX = sx + sw / 2 - doorW / 2;
  const doorY = SCENE.GROUND_Y - doorH;

  // Door frame
  ctx.fillStyle = "#78716C";
  roundRect(ctx, doorX - 3, doorY - 3, doorW + 6, doorH + 3, [4, 4, 0, 0]);
  ctx.fill();

  // Door
  ctx.fillStyle = prosperity > 0.3 ? COLORS.doorLight : COLORS.door;
  roundRect(ctx, doorX, doorY, doorW, doorH, [3, 3, 0, 0]);
  ctx.fill();

  // Door handle
  ctx.fillStyle = "#D4AF37";
  ctx.beginPath();
  ctx.arc(doorX + doorW - 9, doorY + doorH / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Light spill from door
  if (prosperity > 0.3) {
    const lightGrad = ctx.createLinearGradient(
      doorX + doorW / 2, doorY + doorH,
      doorX + doorW / 2, SCENE.GROUND_Y + 8
    );
    lightGrad.addColorStop(0, `rgba(253,224,71,${0.12 * prosperity})`);
    lightGrad.addColorStop(1, "rgba(253,224,71,0)");
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(doorX, doorY + doorH);
    ctx.lineTo(doorX - 14, SCENE.GROUND_Y + 8);
    ctx.lineTo(doorX + doorW + 14, SCENE.GROUND_Y + 8);
    ctx.lineTo(doorX + doorW, doorY + doorH);
    ctx.closePath();
    ctx.fill();
  }

  // Potted plants (appear with prosperity)
  if (prosperity > 0.5) {
    const plantAlpha = Math.min(1, (prosperity - 0.5) * 2);
    drawPlant(ctx, sx + 8, SCENE.GROUND_Y, plantAlpha);
    drawPlant(ctx, sx + sw - 18, SCENE.GROUND_Y, plantAlpha);
  }
}

function drawAwning(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, time: number
) {
  const segments = 7;
  const segW = w / segments;
  for (let i = 0; i < segments; i++) {
    ctx.fillStyle = i % 2 === 0 ? COLORS.awning : COLORS.awningDark;
    const wave = Math.sin(time * 1.2 + i * 0.6) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x + i * segW, y);
    ctx.lineTo(x + (i + 1) * segW, y);
    ctx.lineTo(x + (i + 1) * segW, y + h + wave);
    ctx.quadraticCurveTo(
      x + i * segW + segW / 2, y + h + 5 + wave,
      x + i * segW, y + h + wave
    );
    ctx.closePath();
    ctx.fill();
  }
  // Awning shadow
  ctx.fillStyle = "rgba(0,0,0,0.03)";
  ctx.fillRect(x + 2, y + h, w - 4, 8);
}

function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Frame
  ctx.fillStyle = COLORS.windowFrame;
  roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 3);
  ctx.fill();
  // Glass
  const glassGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  glassGrad.addColorStop(0, "#DBEAFE");
  glassGrad.addColorStop(0.5, "#EFF6FF");
  glassGrad.addColorStop(1, "#DBEAFE");
  ctx.fillStyle = glassGrad;
  roundRect(ctx, x, y, w, h, 2);
  ctx.fill();
  // Cross bars
  ctx.strokeStyle = COLORS.windowFrame;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w / 2, y + h);
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  // Reflection
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 3);
  ctx.lineTo(x + w / 3, y + 3);
  ctx.lineTo(x + 3, y + h / 3);
  ctx.closePath();
  ctx.fill();
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, groundY: number, alpha: number) {
  ctx.globalAlpha = alpha;
  // Pot
  ctx.fillStyle = "#A8A29E";
  ctx.beginPath();
  ctx.moveTo(x, groundY - 16);
  ctx.lineTo(x + 2, groundY);
  ctx.lineTo(x + 10, groundY);
  ctx.lineTo(x + 12, groundY - 16);
  ctx.closePath();
  ctx.fill();
  // Pot rim
  ctx.fillStyle = "#78716C";
  ctx.fillRect(x - 1, groundY - 18, 14, 3);
  // Leaves (more organic shape)
  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.arc(x + 6, groundY - 24, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#16A34A";
  ctx.beginPath();
  ctx.arc(x + 2, groundY - 21, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 10, groundY - 21, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawQRStand(ctx: CanvasRenderingContext2D) {
  const x = SCENE.QR_X;
  const y = SCENE.QR_Y;

  // Stand pole
  ctx.fillStyle = "#A8A29E";
  ctx.fillRect(x + 7, y - 2, 3, 50);

  // Base
  ctx.fillStyle = "#78716C";
  roundRect(ctx, x + 1, y + 44, 15, 5, 2);
  ctx.fill();

  // Card backing
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, x - 1, y - 22, 20, 22, 2);
  ctx.fill();
  ctx.strokeStyle = "#D6D3D1";
  ctx.lineWidth = 0.8;
  roundRect(ctx, x - 1, y - 22, 20, 22, 2);
  ctx.stroke();

  // QR pattern
  ctx.fillStyle = "#1E293B";
  const qs = 2.5;
  const qx = x + 2;
  const qy = y - 19;
  const pattern = [
    [1, 1, 1, 0, 1, 1],
    [1, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1],
    [1, 0, 0, 1, 0, 1],
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
