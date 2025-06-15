CREATE TABLE `categoria_producto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(50) NOT NULL,
	`descripcion` varchar(255),
	`organization_id` int unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `categoria_producto_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `organizations` DROP FOREIGN KEY `organizations_created_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `users` DROP FOREIGN KEY `users_organization_id_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `productos` ADD `costo` decimal(10,2);--> statement-breakpoint
ALTER TABLE `productos` ADD `categoria_id` int unsigned;--> statement-breakpoint
ALTER TABLE `categoria_producto` ADD CONSTRAINT `categoria_producto_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productos` ADD CONSTRAINT `productos_categoria_id_categoria_producto_id_fk` FOREIGN KEY (`categoria_id`) REFERENCES `categoria_producto`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productos` DROP COLUMN `categoria`;