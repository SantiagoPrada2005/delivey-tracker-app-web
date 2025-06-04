CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`nit` int unsigned,
	`phone_service` varchar(20),
	`address` varchar(200),
	`regimen_contribucion` enum('Regimen simplificado','Regimen común'),
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firebase_uid` varchar(255) NOT NULL,
	`email` varchar(255),
	`email_verified` boolean DEFAULT false,
	`phone_number` varchar(50),
	`display_name` varchar(255),
	`photo_url` text,
	`provider_id` varchar(50),
	`role` enum('admin','service_client','delivery','N/A') NOT NULL DEFAULT 'N/A',
	`is_active` boolean NOT NULL DEFAULT true,
	`organization_id` int unsigned,
	`last_login_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_firebase_uid_unique` UNIQUE(`firebase_uid`)
);
--> statement-breakpoint
CREATE TABLE `user_permitions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`description` varchar(100),
	`modify_clients` boolean NOT NULL DEFAULT false,
	`modify-orders` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_permitions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clientes` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `clientes` ADD `organization_id` int unsigned;--> statement-breakpoint
ALTER TABLE `productos` ADD `organization_id` int unsigned;--> statement-breakpoint
ALTER TABLE `pedidos` ADD `organization_id` int unsigned;--> statement-breakpoint
ALTER TABLE `repartidores` ADD `organization_id` int unsigned;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `firebase_uid_idx` ON `users` (`firebase_uid`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `phone_number_idx` ON `users` (`phone_number`);--> statement-breakpoint
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productos` ADD CONSTRAINT `productos_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `repartidores` ADD CONSTRAINT `repartidores_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;