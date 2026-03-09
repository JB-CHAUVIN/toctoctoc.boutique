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
  /** Long-form SEO paragraphs explaining why loyalty matters for this business */
  whyTitle: string;
  whyParagraphs: string[];
  /** Specific benefits for this business type */
  benefits: string[];
  /** Pro tips for this business type */
  proTips: { title: string; desc: string }[];
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
  /** Long-form SEO paragraphs explaining why reviews matter for this business */
  whyTitle: string;
  whyParagraphs: string[];
  /** Specific benefits for this business type */
  benefits: string[];
  /** Pro tips for this business type */
  proTips: { title: string; desc: string }[];
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre boulangerie ?",
    whyParagraphs: [
      "La boulangerie est le commerce de proximité par excellence. Vos clients passent chaque jour ou presque — le matin pour la baguette, le week-end pour les viennoiseries, à midi pour un sandwich. C'est un trafic quotidien que beaucoup de commerces envient. Pourtant, cette régularité est fragile : il suffit qu'une nouvelle boulangerie ouvre à 200 mètres pour que vos habitués testent la concurrence.",
      "La carte de fidélité digitale transforme cette habitude en engagement. Quand votre client sait qu'il est à 3 tampons de son croissant gratuit, il ne va pas voir ailleurs. C'est un mécanisme psychologique puissant : le \"sunk cost\" — on ne veut pas perdre ce qu'on a déjà accumulé. Avec TocTocToc.boutique, ce mécanisme fonctionne à plein car le client voit sa progression en temps réel sur son téléphone.",
      "Les cartes en carton posent un vrai problème : elles se perdent, s'oublient dans une poche de manteau, finissent à la machine. Résultat : votre client fidèle recommence à zéro et perd sa motivation. Avec une carte digitale, plus aucun tampon n'est perdu. Votre client retrouve sa carte en scannant simplement le QR code sur votre comptoir.",
    ],
    benefits: [
      "Vos clients du matin reviennent systématiquement chez vous plutôt que chez le concurrent",
      "Le panier moyen augmente : un client proche de la récompense achète souvent une viennoiserie en plus",
      "Vous récupérez des données précieuses : fréquence de visite, nombre de clients actifs, taux de rétention",
      "Fini les problèmes de cartes perdues — 100% digital, 0% de papier",
      "Le bouche-à-oreille se renforce : vos clients parlent de la carte à leurs voisins et collègues",
    ],
    proTips: [
      {
        title: "Fixez le seuil à 10 tampons",
        desc: "Pour une boulangerie, 10 tampons est le nombre idéal. C'est atteignable en 2 semaines pour un client quotidien, ce qui maintient la motivation sans être trop facile.",
      },
      {
        title: "Offrez un produit, pas une remise",
        desc: "Un croissant offert marque plus qu'une remise de 1€. Le client ressent le cadeau et en parle autour de lui. C'est aussi plus simple à gérer en caisse.",
      },
      {
        title: "Placez le QR code à hauteur des yeux en caisse",
        desc: "Vos clients font la queue et regardent devant eux. Un QR code bien placé à côté de la caisse enregistreuse génère 3x plus de scans qu'un QR code posé sur une table.",
      },
      {
        title: "Annoncez la carte à l'oral",
        desc: "\"Vous connaissez notre carte de fidélité ?\" — cette simple phrase dite en rendant la monnaie double le taux d'adoption. Formez vos vendeurs à la proposer naturellement.",
      },
    ],
    faqExtra: {
      q: "La carte de fidélité fonctionne-t-elle pour les commandes de pains spéciaux et traiteur ?",
      a: "Oui. Vous pouvez tamponner la carte pour n'importe quel type d'achat : pain quotidien, viennoiseries, commandes spéciales, plateaux traiteur. C'est vous qui décidez quand tamponner.",
    },
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre restaurant ?",
    whyParagraphs: [
      "Dans la restauration, acquérir un nouveau client coûte 5 à 7 fois plus cher que de fidéliser un client existant. Pourtant, la majorité des restaurateurs investissent tout leur budget marketing dans l'acquisition (publicité, réseaux sociaux, plateformes de réservation) et rien dans la rétention. La carte de fidélité digitale est l'outil de rétention le plus rentable qui existe.",
      "Un client régulier dépense en moyenne 67% de plus qu'un nouveau client. Il commande des plats qu'il connaît déjà, prend moins de temps à choisir, et laisse souvent un meilleur pourboire. Il recommande aussi votre restaurant à ses proches — le bouche-à-oreille reste le canal d'acquisition n°1 pour un restaurant local.",
      "Avec TocTocToc.boutique, chaque repas rapproche votre client d'une récompense. Qu'il vienne seul le midi ou en famille le soir, chaque visite est comptabilisée. Votre client voit sa progression sur son téléphone et a une raison concrète de revenir chez vous plutôt que chez le concurrent.",
    ],
    benefits: [
      "Augmentation du taux de retour : vos clients reviennent plus souvent pour atteindre la récompense",
      "Le panier moyen grimpe naturellement — un client fidèle commande plus facilement entrée + plat + dessert",
      "Vous lissez votre activité : les clients fidèles viennent aussi en semaine, pas seulement le week-end",
      "Le bouche-à-oreille explose : un client récompensé raconte l'expérience à 3 personnes en moyenne",
      "Données précieuses sur la fréquentation : combien de clients actifs, combien de visites par mois",
    ],
    proTips: [
      {
        title: "Offrez le dessert, pas l'addition",
        desc: "Un dessert offert est perçu comme un cadeau généreux alors qu'il vous coûte peu en marge. Une remise sur l'addition est oubliée immédiatement.",
      },
      {
        title: "Tamponnez au moment de l'addition",
        desc: "Le meilleur moment pour scanner le QR code est quand votre serveur apporte l'addition. Le client attend déjà — c'est un moment naturel et sans friction.",
      },
      {
        title: "6 tampons est le seuil idéal",
        desc: "Pour un restaurant, 6 repas = environ 1 à 2 mois de fidélité. C'est assez court pour rester motivant et assez long pour créer une vraie habitude.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre café ?",
    whyParagraphs: [
      "Le café est un commerce de rituel. Vos clients viennent chaque matin, à la même heure, commandent souvent la même chose. Ce rituel est votre plus grand atout — et votre plus grande fragilité. Car si un concurrent propose un meilleur café, un espace plus agréable, ou simplement une nouveauté, le rituel se brise.",
      "La carte de fidélité digitale ancre le rituel. Votre client ne vient plus \"juste pour un café\" — il vient pour son café ET pour avancer vers sa récompense. C'est un engagement psychologique qui rend le changement de café beaucoup plus coûteux émotionnellement.",
      "Dans un café, les marges sont serrées. Un café offert après 10 achetés représente une remise de 10% — largement compensée par la fidélisation du client qui, sans carte, aurait peut-être essayé le nouveau coffee shop du quartier.",
    ],
    benefits: [
      "Vos habitués restent fidèles même quand un concurrent s'installe à proximité",
      "Le panier moyen augmente : un client qui sait qu'il accumule des points ajoute plus facilement une viennoiserie",
      "Vous créez une communauté de réguliers qui deviennent vos ambassadeurs locaux",
      "Zéro gaspillage de cartes papier — écologique et moderne, comme l'image de votre café",
    ],
    proTips: [
      {
        title: "10 tampons pour un café offert",
        desc: "Le classique \"10ème café offert\" est le standard du secteur. Vos clients le connaissent et l'attendent. Ne réinventez pas la roue.",
      },
      {
        title: "Posez le QR code à côté de la machine à café",
        desc: "Pendant que le barista prépare la commande, le client a 30 secondes de libre. C'est le moment idéal pour scanner.",
      },
      {
        title: "Variez les récompenses",
        desc: "Alternez entre café offert, viennoiserie, et boisson spéciale. La surprise maintient l'excitation et pousse à accumuler plus de tampons.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre salon de coiffure ?",
    whyParagraphs: [
      "Dans la coiffure, la relation client est personnelle. Vos clients vous confient leur image — c'est un lien de confiance fort. Mais cette confiance ne suffit pas toujours à empêcher le switch. Un salon de coiffure qui propose un prix d'appel, une amie qui recommande son coiffeur... les tentations sont nombreuses.",
      "La carte de fidélité digitale ajoute un argument rationnel à la relation émotionnelle. Votre client vous aime ET il est à 2 tampons de son soin capillaire gratuit. Les deux raisons combinées rendent le départ quasi impossible.",
      "En salon de coiffure, le cycle de visite est de 4 à 8 semaines. C'est long — assez pour que le client oublie sa dernière visite ou soit tenté par une offre concurrente. La carte digitale garde le lien vivant : à chaque scan, votre client voit sa progression et se rappelle pourquoi il vient chez vous.",
    ],
    benefits: [
      "Vos clients espacent moins leurs visites pour atteindre la récompense plus vite",
      "Le soin offert est une occasion de faire découvrir un service premium que le client n'aurait pas testé autrement",
      "Vos clientes en parlent entre elles — la carte de fidélité est un sujet de conversation naturel",
      "Vous vous différenciez des salons discount qui jouent uniquement sur le prix",
    ],
    proTips: [
      {
        title: "Offrez un soin plutôt qu'une remise",
        desc: "Un masque capillaire offert a un coût de revient faible mais une valeur perçue élevée. Et le client découvre un service qu'il pourrait acheter ensuite.",
      },
      {
        title: "5 tampons maximum",
        desc: "Avec un cycle de 6 semaines entre deux visites, 5 tampons = 7 mois. C'est le maximum pour rester motivant.",
      },
      {
        title: "Proposez la carte au moment du paiement",
        desc: "Après une coupe réussie, le client est satisfait et réceptif. C'est le moment parfait pour proposer la carte de fidélité.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre salon de beauté ?",
    whyParagraphs: [
      "Le secteur de la beauté est ultra-concurrentiel. Instituts, spas, salons à domicile, box beauté... Vos clientes sont sollicitées en permanence. La fidélisation n'est plus un bonus — c'est une nécessité pour survivre.",
      "Les clientes beauté sont sensibles à l'expérience globale. Une carte de fidélité digitale, moderne et élégante, renforce l'image premium de votre salon. À l'inverse, une carte carton tamponnée à l'encre envoie un signal \"années 2000\" qui détonne avec votre décoration soignée.",
      "Avec TocTocToc.boutique, votre carte de fidélité est aux couleurs de votre salon. Vos clientes la retrouvent en un scan, voient leur progression, et ont une raison concrète de revenir plutôt que de tester le salon d'à côté.",
    ],
    benefits: [
      "Image de marque renforcée : une carte digitale est perçue comme moderne et haut de gamme",
      "Vos clientes découvrent de nouveaux soins via les récompenses — effet cross-sell naturel",
      "Le taux de rétention augmente significativement dans les 3 premiers mois",
      "Vous identifiez vos meilleures clientes et pouvez leur offrir un traitement VIP",
    ],
    proTips: [
      {
        title: "Offrez un soin découverte en récompense",
        desc: "Un soin visage express offert coûte peu en temps et en produit, mais permet à votre cliente de découvrir une prestation qu'elle réservera ensuite à plein tarif.",
      },
      {
        title: "Activez les statuts VIP",
        desc: "TocTocToc permet de créer des paliers (Bronze, Silver, Gold). Vos clientes les plus fidèles adorent se sentir reconnues et privilégiées.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité pour votre salle de sport ?",
    whyParagraphs: [
      "Le plus grand ennemi d'une salle de sport, c'est l'abandon. 80% des inscrits en janvier ont arrêté avant mars. La carte de fidélité digitale ajoute un objectif court terme (\"plus que 3 séances avant mon shake offert\") qui complète l'objectif long terme (\"perdre 5 kilos\"). Les deux ensemble créent une motivation bien plus solide.",
      "Contrairement aux abonnements classiques qui sont payés que le client vienne ou non, la carte de fidélité récompense l'effort réel. Vos adhérents se sentent reconnus pour leur assiduité, pas simplement facturés.",
      "C'est aussi un outil de réengagement puissant. Un adhérent qui n'est pas venu depuis 2 semaines a encore 7 tampons sur 10. Ce \"presque fini\" le pousse à revenir plutôt qu'à abandonner.",
    ],
    benefits: [
      "Taux de rétention en hausse : vos adhérents viennent plus régulièrement",
      "Moins d'abandons : l'objectif court terme maintient la motivation",
      "Vente additionnelle naturelle : les récompenses (shake, serviette) sont des produits que vous vendez déjà",
      "Image moderne et digitale qui attire une clientèle jeune et connectée",
    ],
    proTips: [
      {
        title: "Tamponnez par séance, pas par jour",
        desc: "Un client qui vient 2 fois dans la journée (matin et soir) mérite 2 tampons. Ça récompense l'effort réel.",
      },
      {
        title: "Offrez un shake protéiné",
        desc: "C'est un produit que vous vendez déjà et qui a une forte valeur perçue chez les sportifs. Le coût de revient est faible.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre fleuriste ?",
    whyParagraphs: [
      "Le fleuriste est un commerce d'émotion. Vos clients viennent pour offrir, célébrer, décorer. Mais la fréquence d'achat est souvent faible — anniversaires, fêtes, occasions. La carte de fidélité crée une raison de venir plus souvent : un bouquet de saison \"juste pour soi\", un plant pour la terrasse.",
      "Avec une carte digitale, vous transformez les achats ponctuels en habitude. Votre client qui venait 3 fois par an vient désormais une fois par mois pour avancer vers son bouquet offert. C'est un changement de comportement durable qui booste votre chiffre d'affaires.",
    ],
    benefits: [
      "Augmentation de la fréquence d'achat — vos clients achètent aussi pour eux, pas seulement pour offrir",
      "Différenciation face aux grandes surfaces qui vendent des fleurs à bas prix",
      "Le bouquet offert renforce l'image généreuse et artisanale de votre boutique",
    ],
    proTips: [
      {
        title: "Offrez un bouquet de saison",
        desc: "Un petit bouquet composé de vos invendus du jour est une récompense généreuse pour votre client mais sans perte pour vous.",
      },
      {
        title: "Tamponnez aussi les petits achats",
        desc: "Un plant à 5€ mérite autant un tampon qu'un bouquet à 40€. C'est la fréquence qui crée la fidélité, pas le montant.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité pour votre boulangerie-pâtisserie ?",
    whyParagraphs: [
      "La boulangerie-pâtisserie combine le trafic quotidien du pain et le trafic événementiel de la pâtisserie. La carte de fidélité capitalise sur les deux : chaque baguette achetée rapproche de la récompense, et la récompense (un éclair, une part de tarte) fait découvrir le côté pâtisserie à ceux qui ne viennent que pour le pain.",
      "C'est un cercle vertueux : le client du pain découvre vos pâtisseries grâce à la récompense, et revient ensuite pour en acheter. Votre panier moyen augmente naturellement sans effort commercial.",
    ],
    benefits: [
      "Cross-sell naturel entre le rayon pain et le rayon pâtisserie",
      "Les clients découvrent vos créations via les récompenses et reviennent les acheter",
      "Image artisanale renforcée : la carte digitale montre que vous êtes un artisan moderne",
    ],
    proTips: [
      {
        title: "Offrez une pâtisserie en récompense",
        desc: "Le client qui vient pour la baguette découvre votre savoir-faire pâtissier. C'est un échantillon gratuit qui génère des ventes futures.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre barbershop ?",
    whyParagraphs: [
      "Le barbier est un métier de lien. Vos clients viennent pour la coupe, mais aussi pour l'ambiance, la conversation, le rituel. La carte de fidélité digitale renforce ce lien avec un avantage concret qui s'accumule visite après visite.",
      "Les barbershops se multiplient en France. La concurrence se joue sur l'expérience client, pas sur le prix. Une carte de fidélité digitale — moderne, sur téléphone — s'inscrit parfaitement dans l'image \"lifestyle\" que cultive un barbershop. C'est un signal de professionnalisme.",
      "Vos clients hommes sont souvent moins sensibles aux programmes de fidélité classiques. Mais un rasage offert après 6 coupes ? Ça, ça parle. C'est concret, c'est tangible, et ça récompense un comportement qu'ils ont déjà.",
    ],
    benefits: [
      "Vos clients choisissent votre barbershop plutôt que le concurrent pour ne pas \"perdre\" leurs tampons",
      "Le rasage offert fait découvrir un service premium que beaucoup de clients n'osent pas commander",
      "Image de marque forte : une carte digitale colle à l'image moderne d'un barbershop",
    ],
    proTips: [
      {
        title: "Offrez le rasage à l'ancienne en récompense",
        desc: "C'est le service premium de votre carte. Beaucoup de clients ne l'ont jamais testé. L'offrir en récompense crée un moment mémorable qui génère du bouche-à-oreille.",
      },
      {
        title: "Parlez de la carte pendant la coupe",
        desc: "Votre client est assis pendant 20-30 minutes. C'est le moment parfait pour lui parler de la carte et lui montrer comment ça marche.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre spa ?",
    whyParagraphs: [
      "Le spa est un commerce d'expérience haut de gamme. Vos clients attendent un service irréprochable — de la réservation à la sortie. Une carte de fidélité digitale s'inscrit dans cette exigence : élégante, sans friction, à la hauteur de votre image de marque.",
      "Le cycle de visite en spa est long (1 à 2 mois en moyenne). La carte de fidélité maintient le lien entre les visites. Votre client voit sa progression, anticipe sa prochaine récompense, et planifie sa prochaine visite plutôt que de la reporter indéfiniment.",
      "Les récompenses en spa ont une valeur perçue très élevée. Un \"upgrade de soin\" ou un \"accès privatif offert\" sont perçus comme des cadeaux luxueux, alors que leur coût marginal pour vous est faible — surtout en heures creuses.",
    ],
    benefits: [
      "Expérience cohérente avec l'image premium de votre spa — pas de carton, tout est digital",
      "Les récompenses font découvrir vos soins premium à des clients qui n'auraient pas osé les réserver",
      "Vous remplissez vos créneaux creux avec les soins de récompense",
      "Le système VIP (paliers Bronze/Silver/Gold) est idéal pour l'univers spa",
    ],
    proTips: [
      {
        title: "Offrez un upgrade plutôt qu'un soin gratuit",
        desc: "\"Votre soin 30 min offert en 1h\" est perçu comme très généreux mais ne vous coûte que 30 min de temps. Et le client découvre le soin long.",
      },
      {
        title: "5 tampons maximum",
        desc: "Avec un cycle de visite long, 5 tampons = 5 à 10 mois. Au-delà, la motivation s'effrite.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre pharmacie ?",
    whyParagraphs: [
      "La parapharmacie est un terrain de fidélisation idéal. Contrairement aux médicaments (marges réglementées), les produits parapharmacie offrent des marges confortables et une forte récurrence d'achat. Crèmes, compléments alimentaires, produits solaires... Vos clients reviennent régulièrement et achètent souvent les mêmes produits.",
      "La carte de fidélité digitale sur les achats parapharmacie crée un avantage compétitif face aux pharmacies en ligne et aux grandes surfaces. Votre client a une raison concrète de revenir chez vous plutôt que de commander sur internet : ses tampons l'attendent.",
    ],
    benefits: [
      "Fidélisation du rayon parapharmacie où les marges sont les meilleures",
      "Différenciation face à la concurrence en ligne qui ne peut pas offrir ce type de programme",
      "Découverte de nouveaux produits via les récompenses — génère des ventes récurrentes",
    ],
    proTips: [
      {
        title: "Limitez la carte aux achats parapharmacie",
        desc: "C'est le rayon où vous avez de la marge. Les médicaments sur ordonnance ne doivent pas déclencher de tampon — c'est plus clair pour tout le monde.",
      },
    ],
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
    whyTitle: "Pourquoi une carte de fidélité digitale pour votre traiteur ?",
    whyParagraphs: [
      "Le traiteur vit de la récurrence. Plateaux repas pour les entreprises, buffets événementiels, commandes régulières des particuliers... Vos meilleurs clients commandent plusieurs fois par mois. Mais sans carte de fidélité, ils n'ont aucune raison de ne pas tester un concurrent lors de leur prochaine commande.",
      "La carte de fidélité transforme chaque commande en investissement. Après 3 commandes, votre client est à 1 tampon de son plateau dégustation offert. Il ne va pas aller chez le concurrent maintenant.",
    ],
    benefits: [
      "Fidélisation des clients entreprise qui commandent régulièrement",
      "Le plateau dégustation offert fait découvrir votre gamme complète et génère des commandes plus variées",
      "4 tampons seulement : cycle court adapté aux commandes événementielles espacées",
    ],
    proTips: [
      {
        title: "Ciblez les commandes entreprise",
        desc: "Un tampon par commande d'entreprise crée une fidélité B2B puissante. La personne qui commande les plateaux repas au bureau ne changera pas de traiteur si elle est à 1 tampon de la récompense.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont vitaux pour votre restaurant ?",
    whyParagraphs: [
      "92% des Français consultent les avis Google avant de choisir un restaurant. C'est le premier réflexe : on tape \"restaurant\" sur Google Maps, on regarde les notes, on lit les premiers avis. Si votre restaurant a 3,8★ avec 15 avis et que le concurrent a 4,5★ avec 200 avis, le choix est fait avant même de regarder votre carte.",
      "Le problème, c'est que les clients satisfaits laissent rarement un avis spontanément. Ils ont passé un bon moment, ils partent contents, et ils oublient. Par contre, un client mécontent laisse un avis dans l'heure. Résultat : sans système de collecte, vos avis reflètent surtout les insatisfactions — pas la réalité de votre restaurant.",
      "Avec TocTocToc.boutique, vous inversez cette tendance. En proposant une roulette de récompenses après chaque avis, vous motivez vos clients satisfaits à passer à l'action. Un café offert ou un dessert gratuit suffisent à déclencher un avis 5 étoiles qui booste votre note et votre visibilité sur Google Maps.",
    ],
    benefits: [
      "Votre note Google monte mécaniquement car vous captez enfin les avis positifs",
      "Vous apparaissez plus haut dans les résultats Google Maps de votre zone",
      "Les avis récents rassurent les nouveaux clients — un restaurant avec 50 avis récents inspire plus confiance qu'un avec 50 avis datés",
      "La roulette crée un moment fun qui se raconte : vos clients partagent l'expérience avec leurs proches",
      "Chaque avis mentionne naturellement vos spécialités (\"excellent risotto\", \"vue magnifique\") — c'est du contenu SEO gratuit",
    ],
    proTips: [
      {
        title: "Posez le QR code sur les tables ou au dos du menu",
        desc: "À la fin du repas, quand le client attend l'addition, il a 2 minutes de libre. C'est le moment idéal pour scanner et laisser un avis.",
      },
      {
        title: "Offrez un café ou un digestif en récompense",
        desc: "C'est un coût faible (0,30-0,50€) pour un avis qui vaut potentiellement des centaines d'euros en nouveaux clients acquis.",
      },
      {
        title: "Répondez à chaque avis",
        desc: "Google favorise les fiches où le propriétaire répond aux avis. Prenez 2 minutes par jour pour remercier chaque client.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google comptent pour votre boulangerie ?",
    whyParagraphs: [
      "Quand quelqu'un emménage dans un quartier, son premier réflexe est de chercher \"boulangerie\" sur Google Maps. Il voit les 3 boulangeries les plus proches, compare les notes et les avis, et choisit la mieux notée. Si votre boulangerie a 4,8★ avec 150 avis, vous captez ce nouveau client automatiquement — sans aucune publicité.",
      "Les boulangeries ont un avantage unique : un trafic quotidien énorme. Vous voyez 200 à 500 clients par jour. Si seulement 5% d'entre eux laissent un avis, c'est 10 à 25 avis par jour. En un mois, vous passez de 50 à 800 avis — un score que la plupart des commerces mettent des années à atteindre.",
      "La roulette de récompenses TocTocToc transforme un geste anodin (scanner un QR code en attendant sa baguette) en moment ludique. Votre client tente de gagner un croissant, s'amuse, et laisse un avis positif en prime. C'est gagnant-gagnant.",
    ],
    benefits: [
      "Vous captez les nouveaux habitants du quartier qui cherchent \"boulangerie\" sur Google",
      "Votre trafic quotidien vous permet d'accumuler des avis beaucoup plus vite que n'importe quel autre commerce",
      "Les avis mentionnent vos produits (\"meilleur pain au levain du quartier\") — référencement naturel gratuit",
      "Un croissant offert coûte 0,30€ mais génère un avis qui rapporte bien plus en visibilité",
    ],
    proTips: [
      {
        title: "Placez le QR code à côté de la caisse",
        desc: "Pendant que le client sort sa monnaie ou attend sa commande, il a 20 secondes. Parfait pour scanner le QR code.",
      },
      {
        title: "Formez vos vendeurs à le proposer",
        desc: "\"Un petit avis Google ? Vous pouvez gagner un croissant !\" — cette phrase simple double le nombre de scans.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont essentiels pour votre salon de coiffure ?",
    whyParagraphs: [
      "Le choix d'un coiffeur est une décision de confiance. On ne confie pas ses cheveux à n'importe qui. Avant de pousser la porte de votre salon, votre futur client a lu vos avis Google. Il cherche la confirmation que vous êtes le bon choix — des avis récents, détaillés, enthousiastes.",
      "Les avis avec photos sont particulièrement puissants en coiffure. Quand un client poste \"super coupe, je recommande\" avec une photo, c'est une publicité gratuite qui vaut 100 fois un post Instagram sponsorisé. Avec TocTocToc, vous motivez ces avis spontanés grâce à la roulette.",
      "Un salon de coiffure avec 200+ avis et une note de 4,7★ domine la recherche locale. Quand quelqu'un cherche \"coiffeur + votre ville\" sur Google, vous apparaissez en premier. C'est un flux continu de nouveaux clients, sans budget publicitaire.",
    ],
    benefits: [
      "Les nouveaux clients vous trouvent naturellement sur Google Maps",
      "Les avis détaillés mentionnent vos spécialités (colorations, barbier, lissage brésilien...)",
      "Votre client vient de payer sa coupe : il est satisfait et disponible pour laisser un avis",
      "La roulette crée un moment de complicité entre le coiffeur et son client",
    ],
    proTips: [
      {
        title: "Proposez au moment du brushing final",
        desc: "Votre client se voit dans le miroir avec sa nouvelle coupe. C'est l'instant où la satisfaction est maximale. Montrez le QR code à ce moment.",
      },
      {
        title: "Offrez un soin en récompense",
        desc: "Un masque capillaire posé pendant 5 minutes ne vous coûte presque rien mais a une forte valeur perçue.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont importants pour votre café ?",
    whyParagraphs: [
      "Le marché du café est en pleine explosion. Coffee shops, brûleries artisanales, bars à café... La concurrence se multiplie. Dans ce contexte, votre note Google est votre meilleure arme commerciale. Un café avec 4,8★ attire naturellement les passants, les touristes, et les travailleurs nomades qui cherchent un bon spot.",
      "Les cafés ont un avantage : la fréquence de visite. Un client régulier vient 3 à 5 fois par semaine. Si vous le motivez à laisser un avis une seule fois, et que vous avez 50 réguliers, c'est 50 avis en quelques jours. Avec la roulette TocTocToc, le taux de conversion est encore meilleur car le jeu motive l'action.",
    ],
    benefits: [
      "Les touristes et travailleurs nomades choisissent votre café grâce aux avis Google",
      "Vos réguliers sont vos meilleurs ambassadeurs — ils connaissent votre café par cœur",
      "Un café offert en récompense coûte moins de 0,50€ pour un avis qui vaut des dizaines d'euros en visibilité",
    ],
    proTips: [
      {
        title: "Affichez le QR code à côté du comptoir de commande",
        desc: "Pendant que le barista prépare le café, le client attend 30 secondes. Parfait pour scanner et laisser un avis.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont essentiels pour votre salon de beauté ?",
    whyParagraphs: [
      "Le choix d'un salon de beauté repose avant tout sur la confiance et les recommandations. Vos futures clientes lisent les avis Google avant de prendre rendez-vous — elles cherchent des témoignages détaillés sur la qualité des soins, l'hygiène, et l'accueil. Un salon avec des avis récents et enthousiastes convertit 3 fois plus que celui qui n'en a que quelques-uns datés.",
      "Les soins beauté génèrent naturellement de la satisfaction. Vos clientes sortent détendues, avec une peau éclatante ou des ongles impeccables. C'est le moment idéal pour transformer cette satisfaction en un avis Google. Avec TocTocToc, la perspective d'un soin express gratuit ou d'un produit offert les incite à passer à l'action immédiatement.",
    ],
    benefits: [
      "Vos futures clientes vous découvrent grâce aux avis détaillés mentionnant vos spécialités",
      "Les avis récents rassurent sur la qualité actuelle de vos soins",
      "La roulette de récompenses crée un moment fun en fin de soin qui fidélise",
    ],
    proTips: [
      {
        title: "Proposez le QR code en fin de soin",
        desc: "Votre cliente est détendue et satisfaite. C'est le moment parfait — pas avant le soin quand elle est pressée.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont stratégiques pour votre spa ?",
    whyParagraphs: [
      "Le spa est un achat d'expérience premium. Avant de réserver un soin à 80-150€, votre futur client veut être rassuré. Il lit les avis Google minutieusement — propreté, qualité des soins, ambiance, accueil. Un spa avec 4,8★ et 300 avis détaillés inspire une confiance immédiate.",
      "Les avis de spa sont souvent très détaillés et émotionnels. Vos clients parlent de leur expérience, du cadre, des sensations. C'est le type d'avis que Google adore — long, descriptif, avec des mots-clés naturels. Ces avis boostent votre référencement local de manière spectaculaire.",
    ],
    benefits: [
      "Les avis détaillés de spa sont parmi les plus longs et les plus riches en mots-clés SEO",
      "Un spa bien noté attire une clientèle prête à payer des prestations premium",
      "Les récompenses (accès hammam, upgrade) ont une valeur perçue très élevée pour un coût marginal faible",
    ],
    proTips: [
      {
        title: "Proposez le QR code à l'espace tisanerie",
        desc: "Après le soin, vos clients se détendent à la tisanerie. C'est un moment calme et positif, idéal pour laisser un avis.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google font la différence pour votre salle de sport ?",
    whyParagraphs: [
      "Le choix d'une salle de sport est une décision d'engagement. Un abonnement mensuel, c'est un investissement que le client veut rentabiliser. Avant de s'inscrire, il compare les salles sur Google Maps : équipements, ambiance, propreté, coaching. Les avis sont le facteur n°1 de décision après le prix et la localisation.",
      "Vos adhérents satisfaits sont vos meilleurs vendeurs. Un avis \"Super salle, coachs au top, ambiance motivante\" vaut 10 publicités Facebook. Avec TocTocToc, vous motivez ces avis avec des récompenses sportives (shake, serviette, séance coaching) qui renforcent l'engagement de l'adhérent.",
    ],
    benefits: [
      "Les avis mentionnent naturellement vos équipements et vos coachs — SEO local puissant",
      "Les récompenses sportives renforcent la motivation et l'assiduité de l'adhérent",
      "Vous attirez de nouveaux inscrits sans budget publicitaire grâce au référencement Google Maps",
    ],
    proTips: [
      {
        title: "Placez le QR code à l'accueil et dans les vestiaires",
        desc: "Après l'entraînement, l'adhérent est satisfait et plein d'endorphines. C'est le moment idéal pour un avis positif.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google comptent pour votre barbershop ?",
    whyParagraphs: [
      "Le barbershop est un phénomène de mode en pleine expansion. De nouvelles enseignes ouvrent chaque semaine. Pour se démarquer dans cette concurrence féroce, votre réputation en ligne est déterminante. Un barbershop avec 4,9★ et 500+ avis domine la recherche locale et attire une clientèle fidèle.",
      "Les hommes choisissent souvent leur barbier en tapant \"barbier\" ou \"barbershop\" sur Google Maps. Le premier critère : la note et le nombre d'avis. Le deuxième : les photos (coupes, ambiance, intérieur). En collectant activement vos avis, vous remontez naturellement dans les résultats et captez les clients qui cherchent un nouveau barbier.",
      "Les avis de barbershop sont souvent enthousiastes et spécifiques : \"meilleur dégradé de la ville\", \"ambiance top, café offert\", \"Karim est un artiste\". Ce type d'avis riche en mots-clés booste votre référencement naturel sur des recherches spécifiques.",
    ],
    benefits: [
      "Vous dominez la recherche \"barbier + votre ville\" sur Google Maps",
      "Les avis détaillés mentionnent vos spécialités et créent un référencement naturel puissant",
      "Le rasage offert en récompense fait découvrir un service premium que le client recommandera ensuite",
    ],
    proTips: [
      {
        title: "Montrez le QR code au miroir final",
        desc: "Votre client se voit avec sa nouvelle coupe. Peak de satisfaction. C'est à ce moment qu'il faut demander l'avis.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont importants pour votre fleuriste ?",
    whyParagraphs: [
      "Quand quelqu'un cherche \"fleuriste\" sur Google, c'est souvent urgent : un anniversaire oublié, une invitation de dernière minute, une envie spontanée. Il n'a pas le temps de comparer 10 boutiques — il choisit le fleuriste le mieux noté à proximité. Si vous êtes à 4,8★ avec 100 avis, vous captez ces achats impulsifs automatiquement.",
      "Les avis de fleuriste sont particulièrement visuels et émotionnels. Vos clients mentionnent la fraîcheur des fleurs, la créativité des compositions, le conseil personnalisé. Ces avis authentiques sont bien plus convaincants que n'importe quelle photo Instagram — parce qu'ils viennent de vrais clients.",
    ],
    benefits: [
      "Vous captez les achats impulsifs et urgents via Google Maps",
      "Les avis mentionnent vos spécialités (mariage, deuil, événements) et améliorent votre référencement",
      "Un plant offert coûte quelques euros mais génère un avis qui attire des dizaines de clients",
    ],
    proTips: [
      {
        title: "Proposez le QR code en emballant le bouquet",
        desc: "Pendant que vous préparez le bouquet, le client attend. C'est le moment parfait pour lui montrer le QR code et lui parler de la roulette.",
      },
    ],
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
    whyTitle: "Pourquoi les avis Google sont stratégiques pour votre activité traiteur ?",
    whyParagraphs: [
      "Le traiteur est un métier de confiance. Quand un client commande un buffet pour 50 personnes ou le repas de son mariage, il veut être sûr de faire le bon choix. Les avis Google sont sa principale source de réassurance — il lit les expériences d'autres clients pour se convaincre.",
      "Chaque événement réussi est une opportunité d'avis Google. Un client qui a reçu des compliments sur le buffet à son mariage sera enthousiaste pour laisser un avis détaillé. Ces avis longs et spécifiques sont de l'or pour votre référencement — ils contiennent naturellement des mots-clés comme \"traiteur mariage\", \"buffet entreprise\", \"plateau repas\".",
    ],
    benefits: [
      "Les avis spécifiques (mariage, entreprise, événement) améliorent votre référencement sur ces recherches",
      "Chaque avis détaillé rassure les futurs clients qui hésitent à passer une grosse commande",
      "La remise sur la prochaine commande fidélise et génère du chiffre récurrent",
    ],
    proTips: [
      {
        title: "Envoyez le QR code le lendemain de l'événement",
        desc: "Le client a reçu les compliments de ses invités. Il est au pic de satisfaction. Un SMS avec le lien QR code convertit très bien à ce moment.",
      },
    ],
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
