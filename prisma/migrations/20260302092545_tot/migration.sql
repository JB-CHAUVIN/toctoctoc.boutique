-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `plan` ENUM('FREE', 'STARTER', 'PRO', 'ENTERPRISE') NOT NULL DEFAULT 'FREE',
    `status` ENUM('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `stripeCustomerId` VARCHAR(191) NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `stripePriceId` VARCHAR(191) NULL,
    `currentPeriodStart` DATETIME(3) NULL,
    `currentPeriodEnd` DATETIME(3) NULL,
    `cancelAtPeriodEnd` BOOLEAN NOT NULL DEFAULT false,
    `trialEnd` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancelReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Business` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `shortDesc` VARCHAR(191) NULL,
    `businessType` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'FR',
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `coverUrl` VARCHAR(191) NULL,
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#4f46e5',
    `secondaryColor` VARCHAR(191) NOT NULL DEFAULT '#312e81',
    `accentColor` VARCHAR(191) NOT NULL DEFAULT '#f59e0b',
    `fontFamily` VARCHAR(191) NOT NULL DEFAULT 'Inter',
    `facebookUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `googleMapsUrl` TEXT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `claimToken` VARCHAR(191) NULL,
    `claimedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Business_slug_key`(`slug`),
    UNIQUE INDEX `Business_claimToken_key`(`claimToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessModule` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `module` ENUM('SHOWCASE', 'BOOKING', 'REVIEWS', 'LOYALTY', 'SOCIAL', 'ECOMMERCE', 'PHONE_AI', 'STAFF', 'INVOICING') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusinessModule_businessId_module_key`(`businessId`, `module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingConfig` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `mode` ENUM('APPOINTMENT', 'TABLE', 'CLASS') NOT NULL DEFAULT 'APPOINTMENT',
    `openTime` VARCHAR(191) NOT NULL DEFAULT '09:00',
    `closeTime` VARCHAR(191) NOT NULL DEFAULT '18:00',
    `workDays` JSON NOT NULL,
    `defaultDuration` INTEGER NOT NULL DEFAULT 60,
    `slotInterval` INTEGER NULL,
    `maxPerSlot` INTEGER NULL,
    `bufferTime` INTEGER NOT NULL DEFAULT 15,
    `maxAdvanceDays` INTEGER NOT NULL DEFAULT 30,
    `minAdvanceHours` INTEGER NOT NULL DEFAULT 2,
    `extraFields` JSON NULL,
    `confirmationMsg` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BookingConfig_businessId_key`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `bookingConfigId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `duration` INTEGER NULL,
    `price` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `guestCount` INTEGER NULL,
    `customData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewConfig` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `googleUrl` TEXT NULL,
    `instructions` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReviewConfig_businessId_key`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reward` (
    `id` VARCHAR(191) NOT NULL,
    `reviewConfigId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `probability` DOUBLE NOT NULL DEFAULT 0.1,
    `color` VARCHAR(191) NOT NULL DEFAULT '#4f46e5',
    `emoji` VARCHAR(191) NOT NULL DEFAULT '🎁',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiryDays` INTEGER NOT NULL DEFAULT 30,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `reviewConfigId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `token` VARCHAR(191) NOT NULL,
    `googleReviewInitiated` BOOLEAN NOT NULL DEFAULT false,
    `googleReviewInitiatedAt` DATETIME(3) NULL,
    `rewardId` VARCHAR(191) NULL,
    `rewardCode` VARCHAR(191) NULL,
    `rewardClaimed` BOOLEAN NOT NULL DEFAULT false,
    `rewardClaimedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_token_key`(`token`),
    UNIQUE INDEX `Review_rewardCode_key`(`rewardCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoyaltyConfig` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `cardColor` VARCHAR(191) NOT NULL DEFAULT '#4f46e5',
    `cardTextColor` VARCHAR(191) NOT NULL DEFAULT '#ffffff',
    `stampColor` VARCHAR(191) NOT NULL DEFAULT '#f59e0b',
    `stampIcon` VARCHAR(191) NOT NULL DEFAULT '⭐',
    `stampsRequired` INTEGER NOT NULL DEFAULT 10,
    `rewardName` VARCHAR(191) NOT NULL DEFAULT 'Un produit offert',
    `rewardDescription` VARCHAR(191) NULL,
    `stampExpiryDays` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LoyaltyConfig_businessId_key`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoyaltyCard` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `qrCode` VARCHAR(191) NOT NULL,
    `totalStamps` INTEGER NOT NULL DEFAULT 0,
    `totalRewards` INTEGER NOT NULL DEFAULT 0,
    `currentStamps` INTEGER NOT NULL DEFAULT 0,
    `resetCount` INTEGER NOT NULL DEFAULT 0,
    `lastActivityAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LoyaltyCard_qrCode_key`(`qrCode`),
    UNIQUE INDEX `LoyaltyCard_businessId_customerEmail_key`(`businessId`, `customerEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoyaltyStatus` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `emoji` VARCHAR(191) NOT NULL DEFAULT '⭐',
    `color` VARCHAR(191) NOT NULL DEFAULT '#6366f1',
    `minRewards` INTEGER NOT NULL DEFAULT 1,
    `extraReward` TEXT NULL,
    `inactivityDays` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoyaltyStamp` (
    `id` VARCHAR(191) NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `isReward` BOOLEAN NOT NULL DEFAULT false,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShowcaseBlock` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'ABOUT', 'SERVICES', 'BOOKING_CTA', 'LOYALTY_CTA', 'REVIEWS_CTA', 'CONTACT', 'HOURS', 'BANNER', 'SOCIAL', 'FAQ') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `content` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` VARCHAR(191) NOT NULL,
    `level` ENUM('INFO', 'WARN', 'ERROR') NOT NULL DEFAULT 'INFO',
    `action` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Log_userId_idx`(`userId`),
    INDEX `Log_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactRequest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactRequest_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Business` ADD CONSTRAINT `Business_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessModule` ADD CONSTRAINT `BusinessModule_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingConfig` ADD CONSTRAINT `BookingConfig_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_bookingConfigId_fkey` FOREIGN KEY (`bookingConfigId`) REFERENCES `BookingConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewConfig` ADD CONSTRAINT `ReviewConfig_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reward` ADD CONSTRAINT `Reward_reviewConfigId_fkey` FOREIGN KEY (`reviewConfigId`) REFERENCES `ReviewConfig`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_reviewConfigId_fkey` FOREIGN KEY (`reviewConfigId`) REFERENCES `ReviewConfig`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `Reward`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoyaltyConfig` ADD CONSTRAINT `LoyaltyConfig_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoyaltyCard` ADD CONSTRAINT `LoyaltyCard_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoyaltyStatus` ADD CONSTRAINT `LoyaltyStatus_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoyaltyStamp` ADD CONSTRAINT `LoyaltyStamp_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `LoyaltyCard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShowcaseBlock` ADD CONSTRAINT `ShowcaseBlock_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
