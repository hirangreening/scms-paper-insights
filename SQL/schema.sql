-- ============================================================================
-- SCMS Paper Insights - Database Schema
-- Author: Hiran Greening
-- Description: Creates all tables for the SCMS Paper Insights application
-- ============================================================================

-- Set database (user should create/select database first)
-- Run: CREATE DATABASE paper_insights_db; USE paper_insights_db;

-- ============================================================================
-- Table: Paper
-- Stores all paper metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Paper` (
  `paper_id` int(11) NOT NULL AUTO_INCREMENT,
  `paper_code` varchar(20) NOT NULL,
  `paper_name` varchar(100) NOT NULL,
  PRIMARY KEY (`paper_id`),
  UNIQUE KEY `paper_code` (`paper_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: Staff
-- Stores all staff members (lecturers and tutors)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Staff` (
  `staff_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` enum('Lecturer','Tutor','Other') NOT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: Occurrence
-- Stores each offering of a paper (year, trimester, students, pass rate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Occurrence` (
  `occurrence_id` int(11) NOT NULL AUTO_INCREMENT,
  `paper_id` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `trimester` varchar(20) DEFAULT NULL,
  `num_students` int(11) DEFAULT NULL,
  `pass_rate` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`occurrence_id`),
  KEY `paper_id` (`paper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Table: Occurrence_Staff
-- Junction table linking occurrences to staff (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `Occurrence_Staff` (
  `occurrence_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `role` enum('Lecturer','Tutor','Other') NOT NULL,
  PRIMARY KEY (`occurrence_id`, `staff_id`, `role`),
  KEY `staff_id` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;