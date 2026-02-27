import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ── Utilisateur de test ──────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "test@localsaas.fr" },
    update: {},
    create: {
      email: "test@localsaas.fr",
      name: "Jean Dupont",
      password: passwordHash,
      subscription: {
        create: {
          plan: "STARTER",
          status: "ACTIVE",
        },
      },
    },
  });

  console.log(`✅ Utilisateur créé: ${user.email}`);

  // ── Business démo : Café de la Paix ──────────────
  const business = await prisma.business.upsert({
    where: { slug: "cafe-de-la-paix" },
    update: {},
    create: {
      name: "Café de la Paix",
      slug: "cafe-de-la-paix",
      description:
        "Votre café de quartier depuis 1985. Petit-déjeuners, déjeuners et pâtisseries maison dans une ambiance chaleureuse.",
      shortDesc: "Café & Brasserie — Cuisine maison",
      businessType: "Café",
      address: "12 rue de la République",
      city: "Lyon",
      zipCode: "69001",
      phone: "04 72 00 00 00",
      email: "contact@cafe-de-la-paix.fr",
      primaryColor: "#7c3aed",
      secondaryColor: "#4c1d95",
      accentColor: "#f59e0b",
      isPublished: true,
      userId: user.id,
      modules: {
        create: [
          { module: "SHOWCASE", isActive: true },
          { module: "BOOKING", isActive: true },
          { module: "REVIEWS", isActive: true },
          { module: "LOYALTY", isActive: true },
        ],
      },
    },
  });

  console.log(`✅ Business créé: ${business.name} (/${business.slug})`);

  // ── Config Réservations ──────────────────────────
  const bookingConfig = await prisma.bookingConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      openTime: "08:00",
      closeTime: "18:00",
      workDays: [1, 2, 3, 4, 5, 6],
      defaultDuration: 30,
      bufferTime: 10,
      maxAdvanceDays: 14,
      minAdvanceHours: 1,
      confirmationMsg:
        "Merci pour votre réservation ! Nous vous attendons avec plaisir. En cas d'empêchement, merci de nous prévenir.",
      services: {
        create: [
          {
            name: "Petit-déjeuner",
            description: "Viennoiserie + café ou thé",
            duration: 30,
            price: 8.5,
          },
          {
            name: "Déjeuner",
            description: "Formule du jour (entrée + plat ou plat + dessert)",
            duration: 60,
            price: 14.5,
          },
          {
            name: "Brunch du dimanche",
            description: "Brunch complet — buffet à volonté",
            duration: 90,
            price: 22.0,
          },
        ],
      },
    },
  });

  console.log(`✅ Config réservations créée`);

  // ── Config Avis + Récompenses ────────────────────
  const reviewConfig = await prisma.reviewConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      googleUrl: "https://g.page/r/CbxxxxxEXAMPLE/review",
      instructions:
        "Laissez-nous un avis Google et tentez votre chance pour gagner une surprise ! 🎁",
      rewards: {
        create: [
          {
            name: "Café offert",
            description: "Un café de votre choix offert lors de votre prochaine visite",
            probability: 0.35,
            color: "#7c3aed",
            emoji: "☕",
            expiryDays: 30,
          },
          {
            name: "Viennoiserie offerte",
            description: "Une viennoiserie de votre choix offerte",
            probability: 0.3,
            color: "#f59e0b",
            emoji: "🥐",
            expiryDays: 30,
          },
          {
            name: "-20% sur votre prochaine note",
            description: "20% de réduction sur l'addition lors de votre prochaine visite",
            probability: 0.2,
            color: "#10b981",
            emoji: "💚",
            expiryDays: 60,
          },
          {
            name: "Dessert offert",
            description: "Un dessert du jour offert",
            probability: 0.1,
            color: "#ef4444",
            emoji: "🍰",
            expiryDays: 30,
          },
          {
            name: "Repas offert",
            description: "Un déjeuner complet offert pour 2 personnes !",
            probability: 0.05,
            color: "#f97316",
            emoji: "🏆",
            expiryDays: 90,
          },
        ],
      },
    },
  });

  console.log(`✅ Config avis & récompenses créée`);

  // ── Config Fidélité ──────────────────────────────
  await prisma.loyaltyConfig.upsert({
    where: { businessId: business.id },
    update: {},
    create: {
      businessId: business.id,
      cardColor: "#7c3aed",
      cardTextColor: "#ffffff",
      stampColor: "#f59e0b",
      stampIcon: "☕",
      stampsRequired: 10,
      rewardName: "Un café offert",
      rewardDescription: "Après 10 passages, profitez d'un café entièrement offert !",
      stampExpiryDays: 180,
    },
  });

  console.log(`✅ Config fidélité créée`);

  // ── Carte de fidélité de démo ────────────────────
  await prisma.loyaltyCard.upsert({
    where: { businessId_customerEmail: { businessId: business.id, customerEmail: "client@demo.fr" } },
    update: {},
    create: {
      businessId: business.id,
      customerName: "Marie Martin",
      customerEmail: "client@demo.fr",
      customerPhone: "06 12 34 56 78",
      totalStamps: 7,
      stamps: {
        create: Array.from({ length: 7 }, (_, i) => ({
          createdAt: new Date(Date.now() - (7 - i) * 7 * 24 * 60 * 60 * 1000),
        })),
      },
    },
  });

  console.log(`✅ Carte de fidélité démo créée`);

  console.log("\n🎉 Seeding terminé !");
  console.log("─────────────────────────────");
  console.log(`📧 Email    : test@localsaas.fr`);
  console.log(`🔑 Password : password123`);
  console.log(`🌐 Business : /cafe-de-la-paix`);
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
