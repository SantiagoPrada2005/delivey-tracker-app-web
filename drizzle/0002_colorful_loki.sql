CREATE TABLE `organization_invitations` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`organization_id` int unsigned NOT NULL,
	`invited_email` varchar(255) NOT NULL,
	`invited_by` int unsigned,
	`invitation_token` varchar(255) NOT NULL,
	`assigned_role` enum('admin','service_client','delivery') NOT NULL,
	`status` enum('pending','accepted','rejected','expired','cancelled') NOT NULL DEFAULT 'pending',
	`expires_at` timestamp NOT NULL,
	`accepted_by` int unsigned,
	`accepted_at` timestamp,
	`message` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_invitations_invitation_token_unique` UNIQUE(`invitation_token`)
);
--> statement-breakpoint
CREATE TABLE `organization_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`requested_by` int unsigned NOT NULL,
	`organization_name` varchar(100) NOT NULL,
	`organization_nit` int unsigned,
	`organization_phone` varchar(20),
	`organization_address` varchar(200),
	`organization_regimen` enum('Regimen simplificado','Regimen común'),
	`business_justification` text NOT NULL,
	`contact_name` varchar(100) NOT NULL,
	`contact_position` varchar(100),
	`contact_phone` varchar(20),
	`status` enum('pending','under_review','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`reviewed_by` int unsigned,
	`reviewed_at` timestamp,
	`review_comments` text,
	`created_organization_id` int unsigned,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organization_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `organizations` MODIFY COLUMN `id` int unsigned AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` MODIFY COLUMN `name` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `email` varchar(255);--> statement-breakpoint
ALTER TABLE `organizations` ADD `website` varchar(255);--> statement-breakpoint
ALTER TABLE `organizations` ADD `description` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `logo_url` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `is_active` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `created_by` int unsigned;--> statement-breakpoint
ALTER TABLE `organizations` ADD `allow_invitations` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `require_approval_for_join` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_nit_unique` UNIQUE(`nit`);--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_organization_id_organizations_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_invited_by_users_id_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_invitations` ADD CONSTRAINT `organization_invitations_accepted_by_users_id_fk` FOREIGN KEY (`accepted_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_requests` ADD CONSTRAINT `organization_requests_requested_by_users_id_fk` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_requests` ADD CONSTRAINT `organization_requests_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_requests` ADD CONSTRAINT `organization_requests_created_organization_id_organizations_id_fk` FOREIGN KEY (`created_organization_id`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;