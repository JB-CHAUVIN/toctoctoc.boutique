import puppeteer, { type Page } from "puppeteer";

const VIEWPORT = { width: 1440, height: 900 };
const NAV_TIMEOUT = 15_000;
const SCROLL_PAUSE = 800;

/**
 * Capture a viewport screenshot of a URL using headless Chromium.
 * Returns the screenshot as a base64-encoded JPEG string + the page HTML.
 */
export async function captureScreenshot(url: string): Promise<{ screenshotB64: string; html: string; logoUrl: string | null }> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Block heavy resources that don't affect visual rendering
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (["media", "websocket", "manifest", "other"].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(url, { waitUntil: "networkidle2", timeout: NAV_TIMEOUT });

    // Wait a beat for cookie banners to appear (they often load async)
    await new Promise((r) => setTimeout(r, 1500));

    // Aggressively dismiss cookie banners and overlays
    await dismissOverlays(page);

    // Scroll down slightly to trigger lazy-loaded hero images
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise((r) => setTimeout(r, SCROLL_PAUSE));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    const screenshotBuffer = await page.screenshot({
      type: "jpeg",
      quality: 80,
      fullPage: false,
    });

    const html = await page.content();
    const screenshotB64 = Buffer.from(screenshotBuffer).toString("base64");

    // Try to extract the logo from the page
    const logoUrl = await extractLogoUrl(page, url);

    return { screenshotB64, html, logoUrl };
  } finally {
    await browser.close();
  }
}

// ── Logo extraction ─────────────────────────────────────────────────────────

/** Try to find the website logo by inspecting common patterns */
async function extractLogoUrl(page: Page, baseUrl: string): Promise<string | null> {
  const raw = await page.evaluate(() => {
    // Strategy 1: <link rel="icon"> or <link rel="apple-touch-icon"> (high-res favicons)
    const iconLinks = Array.from(document.querySelectorAll(
      'link[rel="apple-touch-icon"], link[rel="icon"][sizes], link[rel="shortcut icon"]'
    )) as HTMLLinkElement[];
    // Prefer apple-touch-icon (usually 180×180+), then largest icon
    const appleIcon = iconLinks.find((l) => l.rel === "apple-touch-icon");
    if (appleIcon?.href) return appleIcon.href;

    // Strategy 2: <meta property="og:image"> (often the logo or a branded image)
    const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;

    // Strategy 3: <img> in header/nav with "logo" in src, alt, class, or id
    const headerImgs = Array.from(
      document.querySelectorAll("header img, nav img, [class*='logo'] img, img[class*='logo'], img[id*='logo'], img[alt*='logo'], img[alt*='Logo']")
    ) as HTMLImageElement[];
    // Pick the first one that has a reasonable src (not a data-uri placeholder)
    const logoImg = headerImgs.find((img) => {
      const src = img.src || img.currentSrc;
      if (!src || src.startsWith("data:")) return false;
      const rect = img.getBoundingClientRect();
      return rect.width > 20 && rect.width < 500 && rect.height > 20;
    });
    if (logoImg) return logoImg.src || logoImg.currentSrc;

    // Strategy 4: <img> inside an <a> linking to "/" (usually the logo link)
    const homeLinks = Array.from(document.querySelectorAll('a[href="/"], a[href="./"]')) as HTMLAnchorElement[];
    for (const a of homeLinks) {
      const img = a.querySelector("img") as HTMLImageElement | null;
      if (img?.src && !img.src.startsWith("data:")) {
        const rect = img.getBoundingClientRect();
        if (rect.width > 20 && rect.height > 20) return img.src;
      }
      // Also check for SVG inside the home link
      const svg = a.querySelector("svg");
      if (svg) return null; // SVG logo — can't extract as URL easily
    }

    // Strategy 5: og:image as last resort
    if (ogImage?.content) return ogImage.content;

    return null;
  });

  if (!raw) return null;

  // Resolve relative URLs
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return raw.startsWith("http") ? raw : null;
  }
}

// ── Cookie / overlay dismissal ──────────────────────────────────────────────

/** French & English button labels that mean "accept cookies" */
const ACCEPT_LABELS = [
  // French
  "accepter", "tout accepter", "accepter tout", "accepter les cookies",
  "accepter et continuer", "j'accepte", "ok", "d'accord", "continuer",
  "autoriser", "tout autoriser", "accepter & fermer",
  // English
  "accept", "accept all", "accept cookies", "accept all cookies",
  "allow", "allow all", "i agree", "agree", "got it", "okay",
  "continue", "dismiss",
];

/** CSS selectors for known cookie consent libraries */
const CONSENT_SELECTORS = [
  // Axeptio, Tarteaucitron, Didomi, Cookiebot, OneTrust, GDPR banner, etc.
  "#axeptio_overlay", "#axeptio_btn_acceptAll",
  "#tarteaucitronAllAllowed", "#tarteaucitronRoot .tarteaucitronAllow",
  "#didomi-notice-agree-button", "#didomi-popup",
  "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
  "#CybotCookiebotDialog",
  "#onetrust-accept-btn-handler", "#onetrust-banner-sdk",
  ".cc-compliance .cc-allow", ".cc-banner",
  '[data-testid="uc-accept-all-button"]', // Usercentrics
  ".qc-cmp2-summary-buttons button:first-child", // Quantcast
];

async function dismissOverlays(page: Page): Promise<void> {
  // ── Strategy 1: Click known consent library buttons ────────────────
  for (const sel of CONSENT_SELECTORS) {
    await safeClick(page, sel);
  }

  // ── Strategy 2: Click buttons/links by visible text ────────────────
  await clickByText(page);

  // ── Strategy 3: Click generic selector patterns ────────────────────
  const genericSelectors = [
    '[id*="cookie"] button', '[class*="cookie"] button',
    '[id*="consent"] button', '[class*="consent"] button',
    '[id*="cookie"] a', '[class*="cookie"] a',
    'button[class*="accept"]', 'a[class*="accept"]',
    '[class*="gdpr"] button', '[id*="gdpr"] button',
    '[class*="banner"] button[class*="close"]',
    '[class*="modal"] [class*="close"]',
    '[class*="popup"] [class*="close"]',
    '[aria-label="close"]', '[aria-label="Close"]',
    '[aria-label="Fermer"]', '[aria-label="fermer"]',
  ];

  for (const sel of genericSelectors) {
    await safeClick(page, sel);
  }

  // ── Strategy 4: Nuke remaining overlays via CSS injection ──────────
  await page.evaluate(() => {
    // Find elements that look like overlays (fixed/sticky, covering viewport)
    const all = Array.from(document.querySelectorAll("*"));
    for (const el of all) {
      const style = window.getComputedStyle(el);
      const pos = style.position;
      if (pos !== "fixed" && pos !== "sticky") continue;

      const rect = el.getBoundingClientRect();
      const coversWidth = rect.width > window.innerWidth * 0.5;
      const isAtEdge = rect.top < 10 || rect.bottom > window.innerHeight - 10;

      // Skip navbars (typically < 100px tall at the top)
      if (rect.height < 100 && rect.top < 10) continue;

      // If it covers a large portion and looks like an overlay → hide it
      if (coversWidth && (rect.height > 150 || isAtEdge)) {
        const htmlEl = el as HTMLElement;
        // Check if it contains cookie/consent-related text or classes
        const text = (htmlEl.innerText || "").toLowerCase();
        const cls = (htmlEl.className || "").toLowerCase();
        const id = (htmlEl.id || "").toLowerCase();
        const looksLikeCookie =
          /cookie|consent|gdpr|rgpd|privacy|donnée|accepte|politique/i.test(text + cls + id);
        const looksLikeOverlay = style.zIndex !== "auto" && parseInt(style.zIndex) > 100;

        if (looksLikeCookie || looksLikeOverlay) {
          htmlEl.style.display = "none";
        }
      }
    }

    // Also remove any backdrop/overlay divs (opacity < 1, covering everything)
    document.querySelectorAll('[class*="overlay"], [class*="backdrop"], [id*="overlay"]').forEach((el) => {
      const htmlEl = el as HTMLElement;
      const style = window.getComputedStyle(htmlEl);
      if (style.position === "fixed" || style.position === "absolute") {
        htmlEl.style.display = "none";
      }
    });
  });

  // Small pause for DOM to settle after removals
  await new Promise((r) => setTimeout(r, 300));
}

/** Click a button/link whose visible text matches an "accept" label */
async function clickByText(page: Page): Promise<void> {
  await page.evaluate((labels) => {
    const candidates = Array.from(document.querySelectorAll("button, a, [role='button'], input[type='submit']"));
    for (const el of candidates) {
      const text = (el as HTMLElement).innerText?.trim().toLowerCase() || "";
      const value = (el as HTMLInputElement).value?.trim().toLowerCase() || "";
      const match = text || value;
      if (!match) continue;

      for (const label of labels) {
        if (match === label || match.startsWith(label)) {
          // Verify it's likely a consent button (visible, reasonable size)
          const rect = el.getBoundingClientRect();
          if (rect.width > 30 && rect.height > 15 && rect.width < 500) {
            (el as HTMLElement).click();
            return; // One click is enough
          }
        }
      }
    }
  }, ACCEPT_LABELS);

  await new Promise((r) => setTimeout(r, 500));
}

/** Safely try to click a selector, ignore if not found */
async function safeClick(page: Page, selector: string): Promise<void> {
  try {
    const el = await page.$(selector);
    if (el) {
      await el.click();
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch {
    // ignore
  }
}
