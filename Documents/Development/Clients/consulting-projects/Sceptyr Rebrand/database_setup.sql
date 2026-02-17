-- Database setup for Sceptyr contact form submissions
-- Run this SQL in PHPMyAdmin after creating your database

CREATE TABLE IF NOT EXISTS `form_submissions` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `email` varchar(255) NOT NULL,
    `phone` varchar(20) DEFAULT NULL,
    `net_worth` varchar(50) DEFAULT NULL,
    `accredited` enum('Yes','No') DEFAULT NULL,
    `interest` varchar(255) DEFAULT NULL,
    `message` text DEFAULT NULL,
    `monday_item_id` varchar(50) DEFAULT NULL,
    `email_status` enum('success','failed') DEFAULT 'success',
    `ip_address` varchar(45) DEFAULT NULL,
    `user_agent` text DEFAULT NULL,
    `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_submitted_at` (`submitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create admin user table for future dashboard
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL UNIQUE,
    `email` varchar(255) NOT NULL UNIQUE,
    `password_hash` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;