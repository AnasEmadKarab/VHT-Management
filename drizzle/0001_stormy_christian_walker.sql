ALTER TABLE `event_members` ADD `respect` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `event_members` DROP COLUMN `success`;--> statement-breakpoint
ALTER TABLE `events` ADD `respect_gained` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `events` ADD `items_gained` text;