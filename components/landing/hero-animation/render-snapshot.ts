import { type Character, SCENE, PERSON_STYLES } from "./types";
import { drawSky, drawGridPattern, drawGround, drawBackgroundBuildings, drawShop, drawQRStand } from "./draw-scene";
import { drawCharacter, drawMerchant } from "./draw-characters";
import { drawStars, drawParticles, drawFloatingTexts } from "./draw-effects";

export interface SnapshotOptions {
  shopName?: string;
  rating?: number | null;
  reviewCount?: number | null;
}

interface SnapshotState {
  time: number;
  rating: number;
  reviewCount: number;
  merchantMood: number;
  shopGlow: number;
  prosperity: number;
  characters: Character[];
  shopName?: string;
}

function buildBeforeState(opts?: SnapshotOptions): SnapshotState {
  const rating = opts?.rating ?? 2.0;
  const reviewCount = opts?.reviewCount ?? 2;
  return {
    time: 0.5,
    rating,
    reviewCount,
    merchantMood: rating >= 4 ? 0.4 : 0.1,
    shopGlow: 0,
    prosperity: 0,
    characters: [],
    shopName: opts?.shopName,
  };
}

function buildAfterState(opts?: SnapshotOptions): SnapshotState {
  const styles = PERSON_STYLES;
  const beforeCount = opts?.reviewCount ?? 2;
  const characters: Character[] = [
    {
      x: SCENE.QR_X - 15, y: SCENE.GROUND_Y, targetX: SCENE.QR_X,
      speed: 80, state: "celebrating", stateTime: 0.5, hasPhone: true,
      skinColor: styles[0].skin, shirtColor: styles[0].shirt, pantsColor: styles[0].pants,
      direction: 1, scale: 1, scanned: true,
    },
    {
      x: SCENE.SHOP_X + SCENE.SHOP_W / 2 + 30, y: SCENE.GROUND_Y, targetX: SCENE.SHOP_X + SCENE.SHOP_W / 2,
      speed: 80, state: "walking", stateTime: 0, hasPhone: true,
      skinColor: styles[1].skin, shirtColor: styles[1].shirt, pantsColor: styles[1].pants,
      direction: -1, scale: 0.95, scanned: false,
    },
    {
      x: SCENE.QR_X + 50, y: SCENE.GROUND_Y, targetX: SCENE.QR_X + 40,
      speed: 80, state: "scanning", stateTime: 1.0, hasPhone: true,
      skinColor: styles[2].skin, shirtColor: styles[2].shirt, pantsColor: styles[2].pants,
      direction: 1, scale: 0.92, scanned: false,
    },
    {
      x: SCENE.SHOP_X - 40, y: SCENE.GROUND_Y, targetX: SCENE.SHOP_X,
      speed: 80, state: "walking", stateTime: 0, hasPhone: false,
      skinColor: styles[3].skin, shirtColor: styles[3].shirt, pantsColor: styles[3].pants,
      direction: 1, scale: 1.02, scanned: false,
    },
  ];

  return {
    time: 15,
    rating: 4.9,
    reviewCount: beforeCount * 2,
    merchantMood: 1,
    shopGlow: 1,
    prosperity: 1,
    characters,
    shopName: opts?.shopName,
  };
}

function renderState(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, state: SnapshotState) {
  const { time, rating, reviewCount, merchantMood, shopGlow, prosperity, characters, shopName } = state;

  // Zoom on the shop area (like mobile view)
  const visibleW = 550;
  const shopCenterX = SCENE.SHOP_X + SCENE.SHOP_W / 2;
  const scale = canvas.width / visibleW;
  const offsetX = -(shopCenterX - visibleW / 2) * scale;
  const offsetY = (canvas.height - SCENE.H * scale) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  drawSky(ctx);
  drawGridPattern(ctx, time);
  drawBackgroundBuildings(ctx, time);
  drawGround(ctx);
  drawShop(ctx, shopGlow, time, prosperity, shopName);
  drawQRStand(ctx);
  drawMerchant(
    ctx,
    SCENE.SHOP_X + SCENE.SHOP_W / 2 + 60,
    SCENE.GROUND_Y,
    merchantMood,
    time,
  );

  for (const char of characters) {
    drawCharacter(ctx, char, time);
  }

  drawStars(ctx, rating, reviewCount, time);
  drawParticles(ctx, []);
  drawFloatingTexts(ctx, []);

  ctx.restore();
}

/** Renders a "before" or "after" snapshot of the hero animation to a data URL. */
export function renderSnapshot(type: "before" | "after", width = 600, height = 400, opts?: SnapshotOptions): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const state = type === "before" ? buildBeforeState(opts) : buildAfterState(opts);
  renderState(canvas, ctx, state);

  return canvas.toDataURL("image/png");
}
