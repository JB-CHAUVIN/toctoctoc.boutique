/**
 * Default rewards (reviews roulette) and loyalty config per business type.
 * Used during business creation to pre-configure sensible defaults.
 */

// ─────────────────────────────────────────
// REVIEW REWARDS (roulette)
// ─────────────────────────────────────────

export type RewardSeed = {
  name: string;
  description: string;
  probability: number;
  color: string;
  emoji: string;
  expiryDays: number;
  isActive: boolean;
};

function matchType(businessType: string | null, ...keywords: string[]): boolean {
  const t = businessType?.toLowerCase() ?? "";
  return keywords.some((k) => t.includes(k));
}

export function getDefaultRewards(businessType: string | null): RewardSeed[] {
  if (matchType(businessType, "boulangerie", "pâtisserie", "chocolaterie")) {
    return [
      { name: "Croissant offert",     description: "Un croissant au beurre offert",                probability: 0.40, color: "#f59e0b", emoji: "🥐", expiryDays: 14, isActive: true },
      { name: "Baguette offerte",     description: "Une baguette tradition offerte",               probability: 0.30, color: "#d97706", emoji: "🥖", expiryDays: 7,  isActive: true },
      { name: "Café offert",          description: "Un café ou une boisson chaude offerte",        probability: 0.20, color: "#92400e", emoji: "☕", expiryDays: 30, isActive: true },
      { name: "Surprise du chef",     description: "Une création du jour offerte par le chef",     probability: 0.10, color: "#4f46e5", emoji: "🎁", expiryDays: 7,  isActive: true },
    ];
  }

  if (matchType(businessType, "restaurant", "traiteur", "boucherie", "fromagerie", "poissonnerie", "charcuterie")) {
    return [
      { name: "Café offert",    description: "Un café en fin de repas offert",                    probability: 0.40, color: "#92400e", emoji: "☕", expiryDays: 30, isActive: true },
      { name: "Dessert offert", description: "Le dessert de votre choix offert",                  probability: 0.30, color: "#ec4899", emoji: "🍰", expiryDays: 30, isActive: true },
      { name: "Entrée offerte", description: "Une entrée du jour offerte",                        probability: 0.20, color: "#10b981", emoji: "🥗", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",  description: "10% de réduction sur votre prochaine addition",     probability: 0.10, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
    ];
  }

  if (matchType(businessType, "café", "bar", "glacier")) {
    return [
      { name: "Café offert",          description: "Un café ou expresso offert",                  probability: 0.45, color: "#92400e", emoji: "☕", expiryDays: 30, isActive: true },
      { name: "Boisson offerte",      description: "Une boisson fraîche de votre choix offerte",  probability: 0.35, color: "#3b82f6", emoji: "🧃", expiryDays: 30, isActive: true },
      { name: "Viennoiserie offerte", description: "Une viennoiserie au choix offerte",           probability: 0.20, color: "#f59e0b", emoji: "🥐", expiryDays: 14, isActive: true },
    ];
  }

  if (matchType(businessType, "cave à vins")) {
    return [
      { name: "Dégustation offerte",  description: "Une dégustation de 3 vins offerte",           probability: 0.40, color: "#7c3aed", emoji: "🍷", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",        description: "10% sur votre prochaine bouteille",           probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Verre offert",         description: "Un verre de vin offert au comptoir",          probability: 0.25, color: "#dc2626", emoji: "🥂", expiryDays: 14, isActive: true },
    ];
  }

  if (matchType(businessType, "coiffure", "barbier", "beauté", "esthétique", "nail", "spa")) {
    return [
      { name: "Réduction 10%",  description: "10% sur votre prochaine prestation",               probability: 0.50, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Soin offert",    description: "Un soin complémentaire offert",                    probability: 0.30, color: "#ec4899", emoji: "💆", expiryDays: 60, isActive: true },
      { name: "Bon cadeau 5€",  description: "Un bon de 5€ sur votre prochaine prestation",      probability: 0.20, color: "#10b981", emoji: "🎁", expiryDays: 90, isActive: true },
    ];
  }

  if (matchType(businessType, "yoga", "coach", "salle de sport")) {
    return [
      { name: "Séance offerte",    description: "Une séance découverte offerte",                 probability: 0.40, color: "#10b981", emoji: "💪", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",     description: "10% sur votre prochain abonnement",             probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Boisson offerte",   description: "Une boisson ou snack protéiné offert",          probability: 0.25, color: "#f59e0b", emoji: "🥤", expiryDays: 14, isActive: true },
    ];
  }

  if (matchType(businessType, "pharmacie")) {
    return [
      { name: "Échantillon offert",  description: "Un échantillon beauté ou soin offert",        probability: 0.45, color: "#10b981", emoji: "💊", expiryDays: 30, isActive: true },
      { name: "Réduction 5€",        description: "5€ de réduction sur votre prochain achat",    probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Trousse offerte",     description: "Une trousse de voyage offerte",               probability: 0.20, color: "#ec4899", emoji: "🎁", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "dentiste", "médecin", "kiné", "opticien", "vétérinaire", "centre auditif")) {
    return [
      { name: "Réduction 10%",     description: "10% sur votre prochaine consultation",          probability: 0.50, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Bilan offert",      description: "Un bilan complémentaire offert",                probability: 0.30, color: "#10b981", emoji: "🩺", expiryDays: 60, isActive: true },
      { name: "Petit cadeau",      description: "Un petit cadeau offert à votre prochaine visite", probability: 0.20, color: "#f59e0b", emoji: "🎁", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "fleuriste")) {
    return [
      { name: "Rose offerte",         description: "Une rose offerte à votre prochaine visite",  probability: 0.40, color: "#ec4899", emoji: "🌹", expiryDays: 7,  isActive: true },
      { name: "Bouquet miniature",     description: "Un petit bouquet offert",                   probability: 0.30, color: "#f59e0b", emoji: "💐", expiryDays: 7,  isActive: true },
      { name: "Réduction 10%",        description: "10% sur votre prochain achat",               probability: 0.30, color: "#4f46e5", emoji: "🌟", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "librairie")) {
    return [
      { name: "Marque-page offert",   description: "Un marque-page artisanal offert",            probability: 0.40, color: "#92400e", emoji: "📖", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",        description: "10% sur votre prochain achat",               probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Bon d'achat 3€",       description: "Un bon de 3€ sur votre prochain livre",      probability: 0.25, color: "#10b981", emoji: "🎁", expiryDays: 60, isActive: true },
    ];
  }

  if (matchType(businessType, "pressing")) {
    return [
      { name: "Chemise offerte",      description: "Le pressing d'une chemise offert",           probability: 0.40, color: "#3b82f6", emoji: "👔", expiryDays: 30, isActive: true },
      { name: "Réduction 15%",        description: "15% sur votre prochaine commande",           probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 30, isActive: true },
      { name: "Pressing offert",      description: "Le nettoyage d'une pièce offert",            probability: 0.25, color: "#10b981", emoji: "✨", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "épicerie", "superette", "supermarché", "grande surface", "alimentation", "épicerie fine")) {
    return [
      { name: "Produit offert",       description: "Un produit du jour offert",                  probability: 0.40, color: "#10b981", emoji: "🛒", expiryDays: 14, isActive: true },
      { name: "Réduction 5€",         description: "5€ de réduction sur votre prochain achat",   probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 30, isActive: true },
      { name: "Cadeau surprise",      description: "Une surprise offerte en caisse",             probability: 0.25, color: "#f59e0b", emoji: "🎁", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "garage", "concessionnaire", "station service")) {
    return [
      { name: "Lavage offert",       description: "Un lavage intérieur ou extérieur offert",     probability: 0.40, color: "#3b82f6", emoji: "🚗", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",       description: "10% sur votre prochaine prestation",          probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Contrôle offert",     description: "Un contrôle de niveaux offert",               probability: 0.25, color: "#10b981", emoji: "🔧", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "animalerie", "vétérinaire")) {
    return [
      { name: "Friandise offerte",   description: "Un sachet de friandises offert",              probability: 0.40, color: "#f59e0b", emoji: "🐾", expiryDays: 30, isActive: true },
      { name: "Réduction 10%",      description: "10% sur votre prochain achat",                 probability: 0.35, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Jouet offert",       description: "Un jouet pour votre compagnon offert",          probability: 0.25, color: "#10b981", emoji: "🎁", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "vêtements", "chaussures", "bijouterie", "boutique", "décoration", "mobilier", "cadeaux")) {
    return [
      { name: "Réduction 10%",       description: "10% sur votre prochain achat",               probability: 0.45, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Bon d'achat 5€",      description: "5€ offerts sur votre prochaine visite",      probability: 0.35, color: "#10b981", emoji: "💚", expiryDays: 60, isActive: true },
      { name: "Cadeau surprise",     description: "Un cadeau surprise offert",                   probability: 0.20, color: "#ec4899", emoji: "🎁", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "agence de voyage", "immobilier", "assurances", "banque", "avocat", "comptable")) {
    return [
      { name: "Consultation offerte", description: "Une consultation ou un bilan offert",        probability: 0.50, color: "#4f46e5", emoji: "📋", expiryDays: 60, isActive: true },
      { name: "Réduction 10%",       description: "10% sur votre prochaine prestation",          probability: 0.30, color: "#10b981", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Cadeau surprise",     description: "Un petit cadeau de bienvenue",                probability: 0.20, color: "#f59e0b", emoji: "🎁", expiryDays: 30, isActive: true },
    ];
  }

  if (matchType(businessType, "vélo", "électronique", "quincaillerie")) {
    return [
      { name: "Réduction 10%",       description: "10% sur votre prochain achat",               probability: 0.45, color: "#4f46e5", emoji: "🌟", expiryDays: 60, isActive: true },
      { name: "Accessoire offert",   description: "Un accessoire offert",                        probability: 0.35, color: "#10b981", emoji: "🎁", expiryDays: 30, isActive: true },
      { name: "Entretien offert",    description: "Un petit entretien ou contrôle offert",       probability: 0.20, color: "#f59e0b", emoji: "🔧", expiryDays: 30, isActive: true },
    ];
  }

  // Générique (fallback)
  return [
    { name: "Petite surprise",  description: "Un cadeau offert lors de votre prochaine visite",  probability: 0.40, color: "#4f46e5", emoji: "🎁", expiryDays: 30, isActive: true },
    { name: "Bon d'achat 5€",   description: "Un bon d'achat de 5€ à valider en caisse",        probability: 0.30, color: "#10b981", emoji: "💚", expiryDays: 60, isActive: true },
    { name: "Réduction 10%",    description: "10% de réduction sur votre prochain achat",        probability: 0.20, color: "#f59e0b", emoji: "🌟", expiryDays: 60, isActive: true },
    { name: "Cadeau mystère",   description: "Une surprise exclusive",                           probability: 0.10, color: "#ec4899", emoji: "🏆", expiryDays: 30, isActive: true },
  ];
}

// ─────────────────────────────────────────
// LOYALTY CONFIG DEFAULTS
// ─────────────────────────────────────────

export interface LoyaltyConfigSeed {
  stampsRequired: number;
  rewardName: string;
  rewardDescription: string;
  stampIcon: string;
}

export function getDefaultLoyaltyConfig(businessType: string | null): LoyaltyConfigSeed {
  if (matchType(businessType, "boulangerie", "pâtisserie", "chocolaterie")) {
    return { stampsRequired: 10, rewardName: "Une viennoiserie offerte", rewardDescription: "Cumulez 10 tampons et recevez une viennoiserie de votre choix.", stampIcon: "🥐" };
  }
  if (matchType(businessType, "restaurant", "traiteur", "boucherie", "fromagerie", "poissonnerie", "charcuterie")) {
    return { stampsRequired: 10, rewardName: "Un dessert offert", rewardDescription: "Cumulez 10 tampons et recevez un dessert offert.", stampIcon: "🍽️" };
  }
  if (matchType(businessType, "café", "bar", "glacier")) {
    return { stampsRequired: 8, rewardName: "Une boisson offerte", rewardDescription: "Cumulez 8 tampons et recevez une boisson de votre choix.", stampIcon: "☕" };
  }
  if (matchType(businessType, "cave à vins")) {
    return { stampsRequired: 8, rewardName: "Un verre offert", rewardDescription: "Cumulez 8 tampons et recevez un verre de vin offert.", stampIcon: "🍷" };
  }
  if (matchType(businessType, "coiffure", "barbier", "beauté", "esthétique", "nail", "spa")) {
    return { stampsRequired: 8, rewardName: "Un soin offert", rewardDescription: "Cumulez 8 tampons et recevez un soin complémentaire.", stampIcon: "✂️" };
  }
  if (matchType(businessType, "yoga", "coach", "salle de sport")) {
    return { stampsRequired: 10, rewardName: "Une séance offerte", rewardDescription: "Cumulez 10 tampons et recevez une séance gratuite.", stampIcon: "💪" };
  }
  if (matchType(businessType, "pharmacie")) {
    return { stampsRequired: 10, rewardName: "Un produit offert", rewardDescription: "Cumulez 10 tampons et recevez un produit parapharmacie offert.", stampIcon: "💊" };
  }
  if (matchType(businessType, "fleuriste")) {
    return { stampsRequired: 8, rewardName: "Un bouquet offert", rewardDescription: "Cumulez 8 tampons et recevez un bouquet offert.", stampIcon: "🌹" };
  }
  if (matchType(businessType, "pressing")) {
    return { stampsRequired: 10, rewardName: "Un pressing offert", rewardDescription: "Cumulez 10 tampons et recevez le pressing d'une pièce.", stampIcon: "👔" };
  }
  if (matchType(businessType, "garage", "concessionnaire", "station service")) {
    return { stampsRequired: 8, rewardName: "Un lavage offert", rewardDescription: "Cumulez 8 tampons et recevez un lavage offert.", stampIcon: "🚗" };
  }
  if (matchType(businessType, "librairie")) {
    return { stampsRequired: 10, rewardName: "Un livre offert", rewardDescription: "Cumulez 10 tampons et recevez un livre de poche offert.", stampIcon: "📖" };
  }
  if (matchType(businessType, "animalerie")) {
    return { stampsRequired: 10, rewardName: "Un produit offert", rewardDescription: "Cumulez 10 tampons et recevez un produit offert pour votre animal.", stampIcon: "🐾" };
  }
  if (matchType(businessType, "épicerie", "superette", "alimentation", "épicerie fine")) {
    return { stampsRequired: 10, rewardName: "Un produit offert", rewardDescription: "Cumulez 10 tampons et recevez un produit offert.", stampIcon: "🛒" };
  }

  // Générique
  return { stampsRequired: 10, rewardName: "Un cadeau offert", rewardDescription: "Cumulez 10 tampons et recevez un cadeau.", stampIcon: "⭐" };
}
