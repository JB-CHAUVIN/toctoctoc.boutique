-- AlterTable
ALTER TABLE `Business` ADD COLUMN `prospectedAt` DATETIME(3) NULL,
    MODIFY `fontFamily` VARCHAR(191) NOT NULL DEFAULT 'Plus Jakarta Sans';

-- AlterTable
ALTER TABLE `Reward` MODIFY `emoji` VARCHAR(191) NOT NULL DEFAULT '🎁';
