ALTER TABLE `organization_requests` DROP FOREIGN KEY `organization_requests_requested_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `organization_requests` DROP FOREIGN KEY `organization_requests_reviewed_by_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `organization_requests` DROP FOREIGN KEY `organization_requests_created_organization_id_organizations_id_fk`;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `id` int unsigned AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD `slug` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `organizations` ADD CONSTRAINT `organizations_slug_unique` UNIQUE(`slug`);--> statement-breakpoint
ALTER TABLE `organization_requests` ADD CONSTRAINT `org_req_requested_by_fk` FOREIGN KEY (`requested_by`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_requests` ADD CONSTRAINT `org_req_reviewed_by_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `organization_requests` ADD CONSTRAINT `org_req_created_org_fk` FOREIGN KEY (`created_organization_id`) REFERENCES `organizations`(`id`) ON DELETE set null ON UPDATE cascade;