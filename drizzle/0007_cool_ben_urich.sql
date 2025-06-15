ALTER TABLE `repartidores` DROP FOREIGN KEY `repartidores_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `repartidores` DROP FOREIGN KEY `repartidores_organization_id_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `repartidores` MODIFY COLUMN `organization_id` int unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `repartidores` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `repartidores` ADD CONSTRAINT `repartidores_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `repartidores` ADD CONSTRAINT `repartidores_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE cascade;