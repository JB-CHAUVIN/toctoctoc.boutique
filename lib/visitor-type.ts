export type VisitorType = "human" | "seo_bot" | "ai_bot" | "other_bot";

const SEO_BOTS = [
  "googlebot", "bingbot", "yandexbot", "baiduspider", "duckduckbot",
  "slurp", "sogou", "exabot", "facebot", "ia_archiver",
  "mj12bot", "ahrefsbot", "semrushbot", "dotbot", "rogerbot",
  "seznambot", "linkdexbot", "gigabot", "archive.org_bot",
  "applebot", "twitterbot", "linkedinbot", "pinterestbot",
  "screaming frog", "sitebulb", "deepcrawl",
];

const AI_BOTS = [
  "gptbot", "chatgpt-user", "oai-searchbot",
  "claude-web", "claudebot", "anthropic-ai",
  "ccbot", "google-extended", "googleother",
  "bytespider", "petalbot",
  "cohere-ai", "meta-externalagent", "meta-externalfetcher",
  "perplexitybot", "youbot", "ai2bot",
  "diffbot", "omgili", "friendlycrawler",
];

const GENERIC_BOT_PATTERNS = [
  "bot", "crawler", "spider", "scraper", "fetch", "http",
  "curl", "wget", "python-requests", "axios", "node-fetch",
  "go-http-client", "java/", "libwww", "lwp-",
];

export function classifyVisitor(userAgent: string | undefined | null): VisitorType {
  if (!userAgent) return "other_bot";

  const ua = userAgent.toLowerCase();

  if (SEO_BOTS.some((b) => ua.includes(b))) return "seo_bot";
  if (AI_BOTS.some((b) => ua.includes(b))) return "ai_bot";
  if (GENERIC_BOT_PATTERNS.some((p) => ua.includes(p))) return "other_bot";

  return "human";
}

export const VISITOR_TYPE_LABELS: Record<VisitorType, { label: string; emoji: string; color: string }> = {
  human:     { label: "Utilisateur",  emoji: "👤", color: "bg-emerald-500" },
  seo_bot:   { label: "Crawler SEO",  emoji: "🔍", color: "bg-blue-500" },
  ai_bot:    { label: "Crawler IA",   emoji: "🤖", color: "bg-purple-500" },
  other_bot: { label: "Autre bot",    emoji: "🕷️", color: "bg-slate-400" },
};
