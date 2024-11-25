-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`input_term` varchar(512) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`dynamic_sections_content` text,
	`github_pr_url` varchar(512),
	`meta_title` varchar(512),
	`meta_description` varchar(512),
	`meta_h1` varchar(512),
	`linking_categories` json DEFAULT ('[]'),
	`content_takeaways` json,
	`status` enum('ARCHIVED','PUBLISHED'),
	`content_faq` json,
	CONSTRAINT `entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entry_id` int NOT NULL,
	`type` varchar(255),
	`ratings` text NOT NULL,
	`recommendations` text NOT NULL DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`outline` text DEFAULT ('[]'),
	CONSTRAINT `evals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `firecrawl_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`success` tinyint NOT NULL,
	`scrape_id` text,
	`markdown` text,
	`source_url` varchar(512) NOT NULL,
	`status_code` int,
	`title` varchar(512),
	`description` text,
	`language` varchar(512),
	`og_title` varchar(512),
	`og_description` varchar(512),
	`og_url` text,
	`og_image` varchar(512),
	`og_site_name` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`error` text,
	`input_term` varchar(512),
	`summary` text,
	CONSTRAINT `firecrawl_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_source_url` UNIQUE(`source_url`)
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`input_term` varchar(512) NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`source` varchar(255) NOT NULL,
	`source_url` varchar(767),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `keywords_id` PRIMARY KEY(`id`),
	CONSTRAINT `keywords_input_term_keyword_unique` UNIQUE(`input_term`,`keyword`)
);
--> statement-breakpoint
CREATE TABLE `search_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`input_term` varchar(255) NOT NULL,
	`query` varchar(255) NOT NULL,
	`is_term_as_query_ambiguous` tinyint NOT NULL DEFAULT 0,
	`ambiguity_reason` varchar(255) NOT NULL DEFAULT '',
	`clarifying_context` varchar(255) NOT NULL DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `search_queries_id` PRIMARY KEY(`id`),
	CONSTRAINT `search_queries_input_term_unique` UNIQUE(`input_term`)
);
--> statement-breakpoint
CREATE TABLE `section_content_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section_id` int NOT NULL,
	`type` enum('listicle','table','image','code','infographic','timeline','other','text','video') NOT NULL,
	`description` text NOT NULL,
	`why_to_use` text NOT NULL,
	CONSTRAINT `section_content_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entry_id` int NOT NULL,
	`heading` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`order` int NOT NULL,
	`markdown` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sections_to_keywords` (
	`section_id` int NOT NULL,
	`keyword_id` int NOT NULL,
	`created_at` timestamp(3),
	`updated_at` timestamp(3)
);
--> statement-breakpoint
CREATE TABLE `serper_organic_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`search_response_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`link` varchar(767) NOT NULL,
	`snippet` text NOT NULL,
	`position` int NOT NULL,
	`image_url` varchar(767),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`firecrawl_response_id` int,
	CONSTRAINT `serper_organic_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serper_people_also_ask` (
	`id` int AUTO_INCREMENT NOT NULL,
	`search_response_id` int NOT NULL,
	`question` varchar(255) NOT NULL,
	`snippet` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`link` varchar(767) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serper_people_also_ask_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serper_related_searches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`search_response_id` int NOT NULL,
	`query` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serper_related_searches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serper_search_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`input_term` varchar(255) NOT NULL,
	`search_parameters` json NOT NULL,
	`answer_box` json,
	`knowledge_graph` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serper_search_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serper_sitelinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organic_result_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`link` varchar(767) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serper_sitelinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `serper_top_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`search_response_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`link` varchar(767) NOT NULL,
	`source` varchar(255) NOT NULL,
	`date` varchar(255) NOT NULL,
	`image_url` varchar(767) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serper_top_stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `evals` ADD CONSTRAINT `evals_entry_id_entries_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sections` ADD CONSTRAINT `sections_entry_id_entries_id_fk` FOREIGN KEY (`entry_id`) REFERENCES `entries`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `input_term_idx` ON `entries` (`input_term`);--> statement-breakpoint
CREATE INDEX `entry_id_idx` ON `evals` (`entry_id`);--> statement-breakpoint
CREATE INDEX `source_url_idx` ON `firecrawl_responses` (`source_url`);--> statement-breakpoint
CREATE INDEX `input_term_idx` ON `firecrawl_responses` (`input_term`);--> statement-breakpoint
CREATE INDEX `input_term_idx` ON `keywords` (`input_term`);--> statement-breakpoint
CREATE INDEX `source_url_idx` ON `keywords` (`source_url`);--> statement-breakpoint
CREATE INDEX `input_term_idx` ON `search_queries` (`input_term`);--> statement-breakpoint
CREATE INDEX `search_response_id_idx` ON `serper_organic_results` (`search_response_id`);--> statement-breakpoint
CREATE INDEX `link_idx` ON `serper_organic_results` (`link`);--> statement-breakpoint
CREATE INDEX `search_response_id_idx` ON `serper_people_also_ask` (`search_response_id`);--> statement-breakpoint
CREATE INDEX `link_idx` ON `serper_people_also_ask` (`link`);--> statement-breakpoint
CREATE INDEX `search_response_id_idx` ON `serper_related_searches` (`search_response_id`);--> statement-breakpoint
CREATE INDEX `query_idx` ON `serper_related_searches` (`query`);--> statement-breakpoint
CREATE INDEX `input_term_idx` ON `serper_search_responses` (`input_term`);--> statement-breakpoint
CREATE INDEX `organic_result_id_idx` ON `serper_sitelinks` (`organic_result_id`);--> statement-breakpoint
CREATE INDEX `link_idx` ON `serper_sitelinks` (`link`);--> statement-breakpoint
CREATE INDEX `search_response_id_idx` ON `serper_top_stories` (`search_response_id`);--> statement-breakpoint
CREATE INDEX `link_idx` ON `serper_top_stories` (`link`);
*/