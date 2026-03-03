// ─── Données SEO partagées pour les pages features ───────────────────────────

export type LoyaltyTypeData = {
  slug: string;
  label: string;
  emoji: string;
  tagline: string;
  stampTrigger: string;
  rewardThreshold: string;
  rewards: string[];
  heroDesc: string;
  faqExtra?: { q: string; a: string };
};

export type ReviewsTypeData = {
  slug: string;
  label: string;
  emoji: string;
  tagline: string;
  h1: string;
  heroDesc: string;
  rewardExamples: string[];
  faqExtra?: { q: string; a: string };
};

// ─────────────────────────────────────────
// FIDÉLITÉ PAR TYPE
// ─────────────────────────────────────────

export const LOYALTY_TYPES: LoyaltyTypeData[] = [
  {
    slug: "boulangerie",
    label: "Boulangerie",
    emoji: "🥐",
    tagline: "Le 10ème achat offert",
    stampTrigger: "par achat de pain ou viennoiserie",
    rewardThreshold: "10 tampons",
    rewards: ["Croissant offert", "Baguette offerte", "Café offert", "Viennoiserie au choix"],
    heroDesc:
      "Fidélisez vos habitués du matin avec une carte de tampon digitale. Chaque achat en boulangerie rapproche vos clients d'une récompense. Finis les carnets papier perdus !",
  },
  {
    slug: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    tagline: "Le 6ème repas offert",
    stampTrigger: "par repas commandé",
    rewardThreshold: "6 tampons",
    rewards: ["Dessert offert", "Café offert", "Entrée offerte", "-10% sur l'addition"],
    heroDesc:
      "Transformez vos clients de passage en habitués fidèles. Offrez une récompense après chaque repas accumulé et boostez vos tables récurrentes.",
  },
  {
    slug: "cafe",
    label: "Café",
    emoji: "☕",
    tagline: "Votre 10ème café offert",
    stampTrigger: "par café ou commande",
    rewardThreshold: "10 tampons",
    rewards: ["Café offert", "Viennoiserie offerte", "Boisson chaude au choix", "Smoothie offert"],
    heroDesc:
      "Créez des rituels. Vos clients réguliers scannent leur QR code à chaque visite et accumulent des tampons vers leur café gratuit.",
  },
  {
    slug: "salon-de-coiffure",
    label: "Salon de coiffure",
    emoji: "✂️",
    tagline: "La 5ème coupe à -50%",
    stampTrigger: "par coupe ou prestation",
    rewardThreshold: "5 tampons",
    rewards: ["Soin capillaire offert", "Coupe offerte", "-10% sur la prochaine visite", "Produit coiffant offert"],
    heroDesc:
      "Récompensez la fidélité de vos clients coiffure. Après plusieurs passages, offrez un soin, une remise ou une coupe. Le bouche-à-oreille n'en sera que meilleur.",
  },
  {
    slug: "salon-de-beaute",
    label: "Salon de beauté",
    emoji: "💅",
    tagline: "Soin offert après 6 visites",
    stampTrigger: "par soin ou prestation",
    rewardThreshold: "6 tampons",
    rewards: ["Soin visage offert", "Produit beauté offert", "Remise -15%", "Séance d'épilation offerte"],
    heroDesc:
      "Fidélisez votre clientèle bien-être avec une carte digitale élégante à vos couleurs. Chaque soin rapproche vos clientes d'une récompense exclusive.",
  },
  {
    slug: "salle-de-sport",
    label: "Salle de sport",
    emoji: "💪",
    tagline: "Séance offerte après 10",
    stampTrigger: "par séance ou cours",
    rewardThreshold: "10 tampons",
    rewards: ["Séance offerte", "Shake protéiné offert", "Serviette offerte", "Mois à -20%"],
    heroDesc:
      "Motivez vos adhérents à revenir plus souvent. Une carte de fidélité digitale qui récompense leur assiduité avec des cadeaux concrets.",
  },
  {
    slug: "fleuriste",
    label: "Fleuriste",
    emoji: "🌸",
    tagline: "Bouquet offert après 8 achats",
    stampTrigger: "par achat en boutique",
    rewardThreshold: "8 tampons",
    rewards: ["Bouquet offert", "Plant offert", "Remise -10%", "Composition florale offerte"],
    heroDesc:
      "Cultivez la fidélité avec autant de soin que vos fleurs. Récompensez vos clients réguliers avec des cadeaux fleuris grâce à votre carte digitale.",
  },
  {
    slug: "boulangerie-patisserie",
    label: "Boulangerie-Pâtisserie",
    emoji: "🎂",
    tagline: "Gâteau offert après 8 achats",
    stampTrigger: "par achat de pâtisserie ou pain",
    rewardThreshold: "8 tampons",
    rewards: ["Éclair offert", "Part de tarte offerte", "Macaron offert", "Café + viennoiserie"],
    heroDesc:
      "De la baguette au gâteau d'anniversaire, fidélisez vos gourmands avec une carte de tampon adaptée à votre artisanat.",
  },
  {
    slug: "barbier",
    label: "Barbier",
    emoji: "💈",
    tagline: "La 6ème coupe offerte",
    stampTrigger: "par coupe ou rasage",
    rewardThreshold: "6 tampons",
    rewards: ["Coupe offerte", "Rasage complet offert", "Produit barbe offert", "-20% sur la prochaine visite"],
    heroDesc:
      "Dans le monde du barbier, la fidélité ça se mérite — et ça se récompense. Offrez à vos habitués une coupe gratuite après plusieurs passages.",
  },
  {
    slug: "spa",
    label: "Spa",
    emoji: "🧖",
    tagline: "Soin signature après 5 sessions",
    stampTrigger: "par session de soin",
    rewardThreshold: "5 tampons",
    rewards: ["Soin signature offert", "Produit cosmétique offert", "Upgrade de soin", "Accès privatif offert"],
    heroDesc:
      "Offrez une expérience de fidélité aussi premium que vos soins. Vos clients accumulent des passages vers des récompenses bien-être exclusives.",
  },
  {
    slug: "pharmacie",
    label: "Pharmacie / Parapharmacie",
    emoji: "💊",
    tagline: "Produit parapharmacie offert",
    stampTrigger: "par achat en parapharmacie",
    rewardThreshold: "8 tampons",
    rewards: ["Produit beauté offert", "Vitamines offertes", "Crème solaire offerte", "Coffret soin offert"],
    heroDesc:
      "Valorisez vos clients parapharmacie avec une carte de fidélité digitale. Chaque achat les rapproche d'un produit bien-être offert.",
  },
  {
    slug: "traiteur",
    label: "Traiteur",
    emoji: "🥗",
    tagline: "Réduction après 4 commandes",
    stampTrigger: "par commande ou plateau",
    rewardThreshold: "4 tampons",
    rewards: ["Entrée offerte", "Dessert offert", "-15% sur la prochaine commande", "Plateau dégustation offert"],
    heroDesc:
      "Fidélisez vos clients traiteur pour les événements et les commandes régulières. Récompensez leur confiance à chaque commande.",
  },
];

// ─────────────────────────────────────────
// AVIS GOOGLE PAR TYPE
// ─────────────────────────────────────────

export const REVIEWS_TYPES: ReviewsTypeData[] = [
  {
    slug: "restaurant",
    label: "Restaurant",
    emoji: "🍽️",
    tagline: "Plaque avis Google restaurant",
    h1: "Avis Google pour votre restaurant : récoltez et récompensez",
    heroDesc:
      "Après leur repas, vos clients laissent un avis Google en 10 secondes et tentent de gagner un café ou un dessert. Résultat : plus d'avis 5 étoiles, plus de visibilité locale.",
    rewardExamples: ["Café offert", "Dessert de la carte", "Digestif offert", "-10% sur la prochaine addition"],
    faqExtra: {
      q: "Comment afficher le QR code dans mon restaurant ?",
      a: "Vous générez et imprimez votre QR code depuis le tableau de bord en un clic. Posez-le sur les tables, la caisse, ou au dos du menu. Vos clients scannent à la fin du repas.",
    },
  },
  {
    slug: "boulangerie",
    label: "Boulangerie",
    emoji: "🥐",
    tagline: "Boostez les avis Google de votre boulangerie",
    h1: "Boostez les avis Google de votre boulangerie",
    heroDesc:
      "Chaque matin, vos clients repartent avec leur baguette et un sourire. Transformez ce moment en avis 5 étoiles avec une récompense sympathique : un croissant, une baguette gratuite.",
    rewardExamples: ["Croissant offert", "Baguette offerte", "Café offert", "Viennoiserie au choix"],
    faqExtra: {
      q: "Quand demander l'avis à mes clients ?",
      a: "Placez le QR code sur votre comptoir ou à la caisse. Au moment de payer, votre client scanne, laisse son avis depuis Google et découvre sa récompense immédiatement.",
    },
  },
  {
    slug: "salon-de-coiffure",
    label: "Salon de coiffure",
    emoji: "✂️",
    tagline: "Vos clients partagent leur nouvelle coupe",
    h1: "Avis Google salon de coiffure : partagez chaque nouvelle coupe",
    heroDesc:
      "Vos clients repartent avec une nouvelle coupe qu'ils adorent — incitez-les à le dire sur Google. Avec la roulette de récompenses, ils tentent de gagner un soin ou une remise.",
    rewardExamples: ["Soin capillaire offert", "Masque hydratant", "Produit coiffant", "-15% sur la prochaine visite"],
  },
  {
    slug: "cafe",
    label: "Café",
    emoji: "☕",
    tagline: "Transformez chaque café en avis 5 étoiles",
    h1: "Avis Google pour café : transformez chaque visite en 5 étoiles",
    heroDesc:
      "Un café le matin, un avis sur Google, une chance de gagner la prochaine tournée. Vos clients réguliers deviennent vos meilleurs ambassadeurs sur Google Maps.",
    rewardExamples: ["Café suivant offert", "Viennoiserie offerte", "Boisson froide offerte", "Gâteau du jour"],
  },
  {
    slug: "salon-de-beaute",
    label: "Salon de beauté",
    emoji: "💅",
    tagline: "Vos clientes partagent leur expérience beauté",
    h1: "Avis Google salon de beauté : valorisez chaque soin",
    heroDesc:
      "Après un soin, vos clientes sont ravies — c'est le moment de capturer cet enthousiasme. La roulette de récompenses les motive à laisser un avis et à revenir.",
    rewardExamples: ["Soin express offert", "Vernis offert", "Crème hydratante", "-10% sur prochain soin"],
  },
  {
    slug: "spa",
    label: "Spa",
    emoji: "🧖",
    tagline: "Vos clients partagent leur moment de détente",
    h1: "Avis Google spa : capturez chaque expérience bien-être",
    heroDesc:
      "Une séance spa mémorable mérite un avis mémorable. Offrez à vos clients une récompense exclusive pour les remercier de partager leur expérience sur Google.",
    rewardExamples: ["Accès hammam offert", "Produit aromathérapie", "Upgrade de soin", "30 min de massage offert"],
  },
  {
    slug: "salle-de-sport",
    label: "Salle de sport",
    emoji: "💪",
    tagline: "Vos adhérents partagent leurs résultats",
    h1: "Avis Google salle de sport : motivez vos adhérents à témoigner",
    heroDesc:
      "Vos adhérents progressent, ils sont fiers de leur parcours. Transformez cette fierté en avis Google avec une récompense qui renforce leur motivation.",
    rewardExamples: ["Séance coaching offerte", "Shake protéiné", "Serviette offerte", "-20% sur un mois"],
  },
  {
    slug: "barbier",
    label: "Barbier",
    emoji: "💈",
    tagline: "Chaque coupe mérite 5 étoiles",
    h1: "Avis Google barbier : chaque coupe mérite 5 étoiles",
    heroDesc:
      "Vos clients sortent du fauteuil impeccables. C'est le moment idéal pour leur proposer de partager l'expérience sur Google et tenter de gagner leur prochain rasage.",
    rewardExamples: ["Rasage offert", "Produit barbe offert", "-20% coupe suivante", "Soin barbe offert"],
  },
  {
    slug: "fleuriste",
    label: "Fleuriste",
    emoji: "🌸",
    tagline: "Vos clients partagent leurs plus belles compositions",
    h1: "Avis Google fleuriste : valorisez chaque bouquet",
    heroDesc:
      "Vos compositions florales méritent d'être reconnues. Avec la roulette de récompenses, vos clients partagent leur achat sur Google et gagnent une surprise florale.",
    rewardExamples: ["Plant offert", "Remise -10%", "Fleur de saison offerte", "Livraison offerte"],
  },
  {
    slug: "traiteur",
    label: "Traiteur",
    emoji: "🥗",
    tagline: "Chaque événement réussi mérite un avis",
    h1: "Avis Google traiteur : chaque événement mérite sa recommandation",
    heroDesc:
      "Anniversaire, mariage, pot d'entreprise — vos clients sont ravis. Encouragez-les à partager leur expérience sur Google avec une récompense sur leur prochaine commande.",
    rewardExamples: ["-15% prochaine commande", "Plateau dégustation offert", "Livraison offerte", "Dessert offert"],
  },
];

// ─────────────────────────────────────────
// HELPER: recherche par slug
// ─────────────────────────────────────────

export function getLoyaltyTypeBySlug(slug: string): LoyaltyTypeData | undefined {
  return LOYALTY_TYPES.find((t) => t.slug === slug);
}

export function getReviewsTypeBySlug(slug: string): ReviewsTypeData | undefined {
  return REVIEWS_TYPES.find((t) => t.slug === slug);
}
