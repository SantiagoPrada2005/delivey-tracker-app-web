CREATE TABLE `asignaciones_pedido` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`pedido_id` int NOT NULL,
	`repartidor_id` int NOT NULL,
	`fecha_asignacion` timestamp NOT NULL DEFAULT (now()),
	`estado` enum('asignado','en_camino','entregado','cancelado') NOT NULL DEFAULT 'asignado',
	CONSTRAINT `asignaciones_pedido_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido` varchar(100) NOT NULL,
	`telefono` varchar(20) NOT NULL,
	`email` varchar(100) NOT NULL,
	`direccion` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detalles_pedido` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`pedido_id` int NOT NULL,
	`producto_id` int NOT NULL,
	`cantidad` int NOT NULL,
	`precio_unitario` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	CONSTRAINT `detalles_pedido_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`descripcion` text,
	`precio` decimal(10,2) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`categoria` varchar(50),
	`imagen` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`cliente_id` int NOT NULL,
	`estado` enum('pendiente','en_proceso','en_camino','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
	`total` decimal(10,2) NOT NULL,
	`direccion_entrega` text NOT NULL,
	`fecha_entrega` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repartidores` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nombre` varchar(100) NOT NULL,
	`apellido` varchar(100) NOT NULL,
	`telefono` varchar(20) NOT NULL,
	`email` varchar(100),
	`disponible` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `repartidores_id` PRIMARY KEY(`id`)
);
