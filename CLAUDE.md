# TocTocToc.boutique — Contexte Projet Complet

## Vision & Positionnement

**TocTocToc.boutique** est une plateforme SaaS B2B tout-en-un pour digitaliser les commerces locaux en 5 minutes, sans compétences techniques.

- **Tagline** : "Digitalisez votre commerce en 5 minutes"
- **Cible** : Commerçants et prestataires locaux (restaurants, salons de coiffure, boulangeries, cabinets médicaux, coachs, studios yoga, pharmacies, etc.)
- **Proposition de valeur** : Site vitrine + réservation en ligne + collecte d'avis Google + carte de fidélité digitale — le tout dans une seule interface.
- **Concurrent identifié** : Uniiti Business (https://business.uniiti.com/)
- **Langue** : Interface et contenu en français (locale `fr_FR`)

## Modèle Économique

### Plans & Tarification

| Plan | Prix | Max commerces | Modules inclus | Limites |
|------|-------|---|---------|----------|
| **FREE** | 0€/mois | 1 | SHOWCASE, REVIEWS, LOYALTY | 3 avis, 3 cartes fidélité |
| **STARTER** | 9€/mois | 1 | SHOWCASE, BOOKING, REVIEWS, LOYALTY | Illimité |
| **PRO** | 19€/mois | 3 | Starter + SOCIAL | Support prioritaire |
| **ENTERPRISE** | 99€/mois | Illimité | Les 9 modules | Fonctionnalités custom |

- **Stratégie freemium** : Le plan FREE sert d'acquisition (limité à 3 avis/cartes), l'upsell vers STARTER (9€) débloque le booking + illimité.
- **Lock-in multi-commerce** : Le plan PRO (19€) nécessaire dès 2+ commerces.
- **Trial** : 14 jours d'essai, CB requise upfront.
- Le plan STARTER est affiché comme "Populaire" sur la page marketing.

### Parcours Client

1. Prospect → page marketing (`/`) → inscription (`/register`)
2. Création du 1er commerce → configuration des modules
3. Publication du commerce → URL publique `/{slug}`
4. Upgrade vers plan payant pour débloquer plus de fonctionnalités
5. Distribution de QR codes aux clients finaux (avis, fidélité, réservation)

### Système de Prospection (Claim)

L'admin peut prospecter des commerces locaux :
1. Crée un commerce + génère un `claimToken` unique
2. Imprime une lettre A4 avec QR code (`ProspectLetterButton`)
3. Le prospect scanne → `/claim/[token]` → crée son compte
4. Le commerce est automatiquement transféré au prospect
5. Email de bienvenue envoyé

## Stack Technique

### Core

| Technologie | Version | Usage |
|---|---|---|
| Next.js | 14.2.18 | Framework fullstack (App Router) |
| React | 18 | UI |
| TypeScript | 5 | Typage |
| Tailwind CSS | 3.4 | Styling (font: Plus Jakarta Sans) |
| Prisma | 7.4.1 | ORM (adapter MariaDB) |
| MySQL/MariaDB | - | Base de données |
| NextAuth | 5.0.0-beta.25 | Auth (credentials, JWT) |
| Stripe | 17.4.0 | Paiements (API 2025-02-24.acacia) |
| Nodemailer | 8.0.1 | Emails (SMTP self-hosted) |
| Framer Motion | 11 | Animations |

### Librairies Utilitaires

- `date-fns` + `date-fns-tz` — Dates (locale fr)
- `zod` — Validation
- `qrcode` + `jsqr` — Génération/lecture QR codes
- `html-to-image` — Export images (lettres prospect)
- `lucide-react` — Icônes
- `react-hot-toast` — Notifications
- `bcryptjs` — Hash mots de passe
- `clsx` + `tailwind-merge` — Classes CSS

## Architecture du Projet

```
app/
├── (auth)/                 # Pages auth : login, register, forgot/reset-password
├── (dashboard)/            # Dashboard protégé : gestion commerces + modules
├── (site)/[slug]/          # Pages publiques des commerces
├── api/                    # 41 endpoints API REST
│   ├── auth/               # NextAuth + register + password reset
│   ├── business/           # CRUD commerces + modules
│   ├── booking/            # Config, services, réservations
│   ├── reviews/            # Config, avis, récompenses
│   ├── loyalty/            # Config, cartes, tampons, statuts
│   ├── showcase/           # Blocs du site vitrine
│   ├── billing/            # Stripe : checkout, portal, cancel, reactivate
│   ├── webhooks/stripe/    # Webhook Stripe
│   ├── admin/              # Routes admin (claim-token, prospect)
│   ├── claim/              # Transfert de commerce
│   └── user/, contact/     # Profil utilisateur, formulaire contact
├── claim/[token]/          # Page claim prospect
└── contact/                # Page contact publique

components/
├── ui/         # 7 composants de base : button, badge, card, dialog, input, select, toggle
├── dashboard/  # Sidebar, stats, setup-panel, prospect-letter, publish-toggle
├── booking/    # booking-manager, booking-flow, booking-status-widget
├── reviews/    # Composants module avis
├── loyalty/    # qr-scanner, stamp-scanner, loyalty-flow, cards-manager
└── site/       # block-renderer + blocs (hero, about, services, hours, contact, CTA...)

lib/
├── auth.ts       # Config NextAuth (credentials + bcrypt)
├── prisma.ts     # Client Prisma (singleton, MariaDB adapter)
├── stripe.ts     # Singleton Stripe + helpers (getOrCreateCustomer, mapStripeStatus, downgradeModules)
├── email.ts      # Nodemailer transport + sendEmail()
├── constants.ts  # PLAN_LIMITS, MODULES_INFO, BUSINESS_TYPES, CANCEL_REASONS, etc.
└── utils.ts      # cn(), slugify(), formatPrice/Date(), generateRewardCode(), pickRewardByProbability()

emails/           # 8 templates React Email
hooks/            # Custom React hooks
types/            # Types TypeScript
prisma/
├── schema.prisma # 520 lignes, 20 modèles, 7 enums
├── seed.ts       # Données de test (test@localsaas.fr / password123, role ADMIN)
└── migrations/   # Historique migrations
```

## Base de Données (Prisma)

### Modèles Principaux (20)

- **User** : email, password (bcrypt), name, role (USER|ADMIN), emailVerified
- **Subscription** : plan (FREE|STARTER|PRO|ENTERPRISE), status (ACTIVE|TRIALING|PAST_DUE|CANCELLED), champs Stripe
- **Business** : name, slug (unique), description, businessType, adresse, contact, branding (colors, fonts, logo/cover), social links, claimToken, isPublished, deletedAt
- **BusinessModule** : active par commerce + type de module
- **BookingConfig** : mode (APPOINTMENT|TABLE|CLASS), horaires, durées, services liés
- **Service** : nom, prix, durée, lié à BookingConfig
- **Booking** : status (PENDING|CONFIRMED|CANCELLED|COMPLETED|NO_SHOW), customerName/email/phone
- **ReviewConfig** : URL Google, instructions
- **Review** : token unique, tracking Google review, reward (roulette), rewardCode
- **Reward** : nom, probabilité (0-1), couleur, emoji, expiryDays
- **LoyaltyConfig** : design carte (couleurs, icône), stampsRequired, rewardName
- **LoyaltyCard** : qrCode unique, totalStamps, currentStamps, resetCount
- **LoyaltyStamp** : horodatage tampon
- **LoyaltyStatus** : paliers VIP (nom, emoji, minRewards, extraReward)
- **ShowcaseBlock** : type (HERO|ABOUT|SERVICES|HOURS|CONTACT|FAQ|BANNER|SOCIAL|BOOKING_CTA|LOYALTY_CTA|REVIEWS_CTA), contenu JSON
- **Log** : level (INFO|WARN|ERROR), message, metadata JSON — audit trail
- **ContactRequest** : soumissions formulaire contact

### Enums

`UserRole`, `PlanType`, `SubStatus`, `ModuleType` (9 valeurs : SHOWCASE, BOOKING, REVIEWS, LOYALTY, SOCIAL, ECOMMERCE, PHONE_AI, STAFF, INVOICING), `BookingMode`, `BookingStatus`, `ShowcaseBlockType`, `LogLevel`

## Modules Fonctionnels

### 1. Showcase (Site Vitrine)
- Architecture par blocs configurables (11 types)
- Branding personnalisable : couleurs (primary/secondary/accent), police, logo, cover
- Chaque bloc a un contenu JSON flexible + toggle actif/inactif + ordre

### 2. Booking (Réservation)
- 3 modes : APPOINTMENT (services), TABLE (restaurant), CLASS (cours collectifs)
- Services avec tarif et durée personnalisés
- Créneaux configurables : horaires, jours ouvrés, intervalle, buffer, limites d'avance
- Champs extra personnalisables (JSON)
- Statuts : PENDING → CONFIRMED → COMPLETED (ou CANCELLED/NO_SHOW)

### 3. Reviews (Avis Google + Gamification)
- Collecte d'avis via QR code ou lien unique par client
- Redirection vers Google Maps pour l'avis
- Roulette de récompenses (roue de la fortune) après avis
- Récompenses configurables avec probabilités, emojis, couleurs, expiration
- Code de récompense unique à valider en commerce

### 4. Loyalty (Fidélité)
- Carte de fidélité digitale avec QR code unique
- Tamponnage par scan QR (caméra du commerçant)
- Compteur de tampons avec seuil de récompense configurable
- Système de statuts VIP par paliers (emoji, couleur, bonus)
- Historique complet des tampons

### 5. Modules à venir (comingSoon: true)
- **SOCIAL** : Publication automatique réseaux sociaux
- **ECOMMERCE** : Boutique en ligne
- **PHONE_AI** : Standard téléphonique IA
- **STAFF** : Gestion d'équipe / planning
- **INVOICING** : Facturation électronique (conformité FR)

## Conventions de Code

### API Routes
- Auth : `const session = await auth(); if (!session?.user?.id) return 401`
- Réponse succès : `NextResponse.json({ success: true, data: ... })`
- Réponse erreur : `NextResponse.json({ error: "message" }, { status: 4xx })`
- Admin : toujours vérifier le rôle en DB (`prisma.user.findUnique({ select: { role: true } })`), jamais via le JWT

### UI
- Badge variants : `default | success | warning | danger | info | outline`
- Composants de base dans `components/ui/` (button, badge, card, dialog, input, select, toggle)
- Font par défaut : Plus Jakarta Sans
- Palette brand : couleurs 50-900 dans tailwind.config.ts
- Animations custom : spin-slow, fade-in, slide-in, roulette

### Helpers importants
- `cn()` — merge classes Tailwind
- `slugify()` — slugs URL sans accents
- `formatPrice()` / `formatDate()` / `formatDateTime()` — locale FR
- `generateRewardCode()` — code 6 caractères uppercase
- `pickRewardByProbability()` — sélection pondérée aléatoire

## Environnement & Déploiement

### Variables d'Environnement

```
DATABASE_URL, AUTH_SECRET, AUTH_URL
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_STARTER_MONTHLY, STRIPE_PRICE_PRO_MONTHLY
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET, S3_REGION, NEXT_PUBLIC_S3_PUBLIC_URL
NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME
OPENAI_API_KEY (préparé pour futurs modules IA)
```

### Développement Local

```bash
yarn dev          # next dev -p 2203
yarn db:push      # Sync schema Prisma
yarn db:studio    # Interface Prisma Studio
yarn dev:init     # db:push + seed
stripe listen --forward-to localhost:2203/api/webhooks/stripe  # Webhook Stripe local
```

- Seed : `test@localsaas.fr` / `password123` (ADMIN) + commerce démo "Café de la Paix"

### Production

- **Serveur** : `rocky@149.202.79.205` → `/home/rocky/projets/toctoctoc`
- **Process** : PM2 (`toctoctoc`), port 3800
- **Déployer** : `./scripts/deploy.sh [branch]` (défaut: main)
- **Images** : Cloudflare R2 / S3 compatible
- **Email** : SMTP self-hosted (mail.toctoctoc.boutique)

## SEO & Metadata

- Title : "TocTocToc.boutique — Digitalisez votre commerce local"
- Description : "Plateforme SaaS tout-en-un pour les commerces locaux : réservations, avis, fidélité, site vitrine."
- Keywords : commerce local, réservation, fidélité, avis google, site vitrine
- OpenGraph : locale fr_FR
- Chaque page commerce génère ses propres métadonnées depuis les données business

## Stratégie Marketing

- **Acquisition** : Plan FREE comme porte d'entrée (0 friction)
- **Prospection terrain** : Admin crée des commerces, imprime des lettres QR → le prospect claim son commerce
- **Upsell** : Limites du FREE (3 avis/cartes) poussent vers STARTER (9€)
- **Rétention** : Plus le commerçant utilise de modules, plus il est captif
- **Multi-commerce** : Les franchisés/multi-sites doivent passer PRO (19€)
- **Enterprise** : Grandes chaînes, marques blanches potentielles
