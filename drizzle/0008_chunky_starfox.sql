ALTER TABLE `detalles_pedido` ADD `nota_producto` varchar(100);--> statement-breakpoint
ALTER TABLE `detalles_pedido` ADD CONSTRAINT `detalles_pedido_pedido_id_pedidos_id_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detalles_pedido` ADD CONSTRAINT `detalles_pedido_producto_id_productos_id_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detalles_pedido` DROP COLUMN `precio_unitario`;--> statement-breakpoint
ALTER TABLE `detalles_pedido` DROP COLUMN `subtotal`;