import { type Character, type Particle, type FloatingText, SCENE, PERSON_STYLES } from "./types";
import { drawSky, drawGridPattern, drawGround, drawBackgroundBuildings, drawShop, drawQRStand } from "./draw-scene";
import { drawCharacter, drawMerchant } from "./draw-characters";
import { drawStars, drawParticles, drawFloatingTexts, drawConstellationNetwork, drawRoulette } from "./draw-effects";

interface SceneState {
  time: number;
  characters: Character[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  rating: number;
  reviewCount: number;
  merchantMood: number;
  shopGlow: number;
  prosperity: number;
  rouletteProgress: number;
  nextSpawnTime: number;
  customerIndex: number;
}

function createState(): SceneState {
  return {
    time: 0,
    characters: [],
    particles: [],
    floatingTexts: [],
    rating: 2.0,
    reviewCount: 2,
    merchantMood: 0,
    shopGlow: 0,
    prosperity: 0,
    rouletteProgress: -1,
    nextSpawnTime: 1,
    customerIndex: 0,
  };
}

function getAct(t: number): 1 | 2 | 3 | 4 {
  if (t < 0.8) return 1;
  if (t < 4) return 2;
  if (t < 12) return 3;
  return 4;
}

function spawnCustomer(state: SceneState, fromRight: boolean): Character {
  const style = PERSON_STYLES[state.customerIndex % PERSON_STYLES.length];
  const isFirst = state.customerIndex === 0;
  state.customerIndex++;
  // First customer spawns close to the shop for a quick start
  const startX = isFirst ? 250 : fromRight ? SCENE.W + 40 : -40;
  const dir: 1 | -1 = fromRight && !isFirst ? -1 : 1;
  return {
    x: startX,
    y: SCENE.GROUND_Y,
    targetX: SCENE.QR_X + (fromRight && !isFirst ? 40 : -20),
    speed: isFirst ? 160 : 80 + Math.random() * 40,
    state: "walking",
    stateTime: 0,
    hasPhone: true,
    skinColor: style.skin,
    shirtColor: style.shirt,
    pantsColor: style.pants,
    direction: dir,
    scale: 0.9 + Math.random() * 0.15,
    scanned: false,
  };
}

function updateCharacter(char: Character, dt: number, state: SceneState) {
  char.stateTime += dt;

  switch (char.state) {
    case "walking": {
      const dx = char.targetX - char.x;
      if (Math.abs(dx) < 5) {
        char.state = "scanning";
        char.stateTime = 0;
        char.direction = 1;
      } else {
        char.x += Math.sign(dx) * char.speed * dt;
        char.direction = dx > 0 ? 1 : -1;
      }
      break;
    }
    case "scanning": {
      if (char.stateTime > 1.2 && !char.scanned) {
        char.scanned = true;
        const boost = 0.2 + Math.random() * 0.3;
        state.rating = Math.min(4.9, state.rating + boost);
        state.reviewCount += 1;
        state.floatingTexts.push({
          x: char.x + (Math.random() - 0.5) * 40,
          y: SCENE.GROUND_Y - 70 - Math.random() * 30,
          text: "+1 avis \u2B50",
          life: 2.5,
          maxLife: 2.5,
          color: "#F59E0B",
          fontSize: 16,
        });
        emitStarParticles(char.x, SCENE.GROUND_Y - 70, state);
        state.rouletteProgress = 0;
      }
      if (char.stateTime > 2.5) {
        char.state = "celebrating";
        char.stateTime = 0;
      }
      break;
    }
    case "celebrating": {
      if (char.stateTime > 2) {
        char.state = "entering";
        char.stateTime = 0;
        char.targetX = SCENE.SHOP_X + SCENE.SHOP_W / 2;
        char.direction = char.x < char.targetX ? 1 : -1;
      }
      break;
    }
    case "entering": {
      const dx = char.targetX - char.x;
      if (Math.abs(dx) < 5) {
        char.state = "exiting";
        char.stateTime = 0;
      } else {
        char.x += Math.sign(dx) * char.speed * 0.8 * dt;
        char.direction = dx > 0 ? 1 : -1;
      }
      break;
    }
    case "exiting": {
      if (char.stateTime > 1) {
        const exitDir = Math.random() > 0.5 ? 1 : -1;
        char.targetX = exitDir > 0 ? SCENE.W + 60 : -60;
        char.state = "walking";
        char.stateTime = 0;
        char.scanned = true;
      }
      break;
    }
  }
}

function emitStarParticles(x: number, y: number, state: SceneState) {
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 60;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      life: 1.5,
      maxLife: 1.5,
      color: Math.random() > 0.5 ? "#F59E0B" : "#FDE68A",
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles.filter((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 20 * dt;
    p.life -= dt;
    return p.life > 0;
  });
}

function updateTexts(texts: FloatingText[], dt: number): FloatingText[] {
  return texts.filter((t) => {
    t.life -= dt;
    return t.life > 0;
  });
}

export function createAnimationController(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  if (!ctx) return { start() {}, stop() {}, resize() {} };

  let state = createState();
  let animId = 0;
  let lastTime = 0;
  let running = false;
  let isMobile = false;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    isMobile = rect.width < 768;
  }

  function update(dt: number) {
    // On mobile, speed up acts 1 & 2
    let act = getAct(state.time);
    const speedMult = isMobile && (act === 1 || act === 2) ? 3 : 1;
    state.time += dt * speedMult;

    // End of cycle — restart immediately
    if (state.time >= SCENE.CYCLE_DURATION) {
      state = createState();
      return;
    }

    act = getAct(state.time);

    const targetMood = act === 1 ? 0.1 : act === 2 ? 0.4 : act === 3 ? 0.7 : 1;
    const targetGlow = act === 1 ? 0 : act === 2 ? 0.3 : act === 3 ? 0.6 : 1;
    const targetProsperity = act === 1 ? 0 : act === 2 ? 0.2 : act === 3 ? 0.5 : 1;

    state.merchantMood += (targetMood - state.merchantMood) * dt * 2;
    state.shopGlow += (targetGlow - state.shopGlow) * dt * 2;
    state.prosperity += (targetProsperity - state.prosperity) * dt * 2;

    // Spawn customers
    if (state.time > state.nextSpawnTime && act >= 2) {
      const interval = act === 2 ? 5 : act === 3 ? 3 : 2;
      state.nextSpawnTime = state.time + interval;
      state.characters.push(spawnCustomer(state, state.customerIndex % 2 === 0));
    }

    for (const char of state.characters) {
      updateCharacter(char, dt, state);
    }
    state.characters = state.characters.filter(
      (c) => (c.x > -80 && c.x < SCENE.W + 80) || !c.scanned
    );

    // Roulette — slower spin
    if (state.rouletteProgress >= 0 && state.rouletteProgress < 1) {
      state.rouletteProgress += dt * 0.25;
      if (state.rouletteProgress > 1) state.rouletteProgress = -1;
    }

    // Background particles
    if (Math.random() < dt * 2) {
      state.particles.push({
        x: Math.random() * SCENE.W,
        y: Math.random() * SCENE.GROUND_Y,
        vx: (Math.random() - 0.5) * 10,
        vy: -5 - Math.random() * 10,
        life: 3 + Math.random() * 3,
        maxLife: 6,
        color: "rgba(129,140,248,0.3)",
        size: 1 + Math.random() * 2,
      });
    }

    state.particles = updateParticles(state.particles, dt);
    state.floatingTexts = updateTexts(state.floatingTexts, dt);

    // Act 4: ensure high rating
    if (act === 4) {
      state.rating += (4.9 - state.rating) * dt * 1.5;
      if (state.reviewCount < 142) state.reviewCount += Math.ceil(dt * 15);
      if (state.reviewCount > 142) state.reviewCount = 142;
    }
  }

  function draw() {
    if (canvas.width === 0 || canvas.height === 0) {
      resize();
      return;
    }

    // On narrow screens, zoom into the shop area instead of showing full width
    const shopCenterX = SCENE.SHOP_X + SCENE.SHOP_W / 2;
    const aspectRatio = canvas.width / canvas.height;
    // Wide screens: full scene centered. Narrow screens: zoom on shop
    const isWide = aspectRatio > 1.5;
    const visibleW = isWide ? SCENE.W : Math.max(400, Math.min(SCENE.W, aspectRatio * 400));
    const scale = canvas.width / visibleW;
    const offsetX = isWide ? (canvas.width - SCENE.W * scale) / 2 : -(shopCenterX - visibleW / 2) * scale;
    const offsetY = (canvas.height - SCENE.H * scale) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    let fadeAlpha = 1;
    if (state.time < 0.3) fadeAlpha = 0.5 + state.time * 1.67;
    ctx.globalAlpha = fadeAlpha;

    drawSky(ctx);
    drawConstellationNetwork(ctx, state.prosperity, state.time);
    drawGridPattern(ctx, state.time);
    drawBackgroundBuildings(ctx, state.time);
    drawGround(ctx);
    drawShop(ctx, state.shopGlow, state.time, state.prosperity);
    drawQRStand(ctx);
    drawMerchant(
      ctx,
      SCENE.SHOP_X + SCENE.SHOP_W / 2 + 60,
      SCENE.GROUND_Y,
      state.merchantMood,
      state.time
    );

    for (const char of state.characters) {
      if (char.state !== "exiting") {
        drawCharacter(ctx, char, state.time);
      }
    }

    drawStars(ctx, state.rating, state.reviewCount, state.time);
    drawParticles(ctx, state.particles);
    drawFloatingTexts(ctx, state.floatingTexts);
    if (state.rouletteProgress >= 0) {
      drawRoulette(ctx, SCENE.QR_X + 10, SCENE.QR_Y - 30, state.rouletteProgress, state.time);
    }

    ctx.restore();
  }

  function frame(ts: number) {
    if (!running) return;
    const dt = Math.min((ts - lastTime) / 1000, 0.1);
    lastTime = ts;
    if (dt > 0) {
      update(dt);
      draw();
    }
    animId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    resize();
    lastTime = performance.now();
    animId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animId);
  }

  return { start, stop, resize };
}
