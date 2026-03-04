-- AlterTable
ALTER TABLE `Business` ADD COLUMN `logoBackground` VARCHAR(191) NULL,
    ADD COLUMN `promoCode` VARCHAR(191) NULL,
    ADD COLUMN `stripePromoCodeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Reward` MODIFY `emoji` VARCHAR(191) NOT NULL DEFAULT '🎁';

-- CreateTable
CREATE TABLE `ProspectInfo` (
    `id` VARCHAR(191) NOT NULL,
    `paperType` VARCHAR(191) NOT NULL DEFAULT 'A4 200g',
    `printableSize` VARCHAR(191) NOT NULL DEFAULT '9.3 × 9.3 cm',
    `businessId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProspectInfo_businessId_key`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrintOrder` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `items` JSON NOT NULL,
    `totalAmount` INTEGER NOT NULL,
    `stripeSessionId` VARCHAR(191) NULL,
    `stripePaymentIntentId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `shippingName` VARCHAR(191) NOT NULL,
    `shippingAddress` VARCHAR(191) NOT NULL,
    `shippingCity` VARCHAR(191) NOT NULL,
    `shippingZipCode` VARCHAR(191) NOT NULL,
    `shippingCountry` VARCHAR(191) NOT NULL DEFAULT 'FR',
    `shippingPhone` VARCHAR(191) NULL,
    `shippingEmail` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PrintOrder_stripeSessionId_key`(`stripeSessionId`),
    INDEX `PrintOrder_businessId_idx`(`businessId`),
    INDEX `PrintOrder_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProspectStreet` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL DEFAULT 'Paris',
    `geometry` JSON NULL,
    `searchedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProspectStreet_name_city_key`(`name`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProspectLead` (
    `id` VARCHAR(191) NOT NULL,
    `streetId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `osmId` VARCHAR(191) NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `googleMapsUrl` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `businessType` VARCHAR(191) NULL,
    `status` ENUM('DISCOVERED', 'CONTACTED', 'CONVERTED', 'DECLINED') NOT NULL DEFAULT 'DISCOVERED',
    `businessId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `contactedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProspectLead_streetId_idx`(`streetId`),
    INDEX `ProspectLead_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProspectInfo` ADD CONSTRAINT `ProspectInfo_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrintOrder` ADD CONSTRAINT `PrintOrder_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `Business`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProspectLead` ADD CONSTRAINT `ProspectLead_streetId_fkey` FOREIGN KEY (`streetId`) REFERENCES `ProspectStreet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
