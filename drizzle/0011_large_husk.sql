ALTER TABLE `detalles_pedido` DROP FOREIGN KEY `detalles_pedido_pedido_id_pedidos_id_fk`;
--> statement-breakpoint
ALTER TABLE `detalles_pedido` DROP FOREIGN KEY `detalles_pedido_producto_id_productos_id_fk`;
--> statement-breakpoint
ALTER TABLE `detalles_pedido` ADD CONSTRAINT `detalles_pedido_pedido_id_pedidos_id_fk` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `detalles_pedido` ADD CONSTRAINT `detalles_pedido_producto_id_productos_id_fk` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE cascade ON UPDATE cascade;