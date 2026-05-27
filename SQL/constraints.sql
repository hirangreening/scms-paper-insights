-- ============================================================================
-- SCMS Paper Insights - Constraints & Indexes
-- Author: Hiran Greening
-- Description: Adds foreign keys, unique constraints, and performance indexes
-- Run this AFTER schema.sql and data.sql
-- ============================================================================

-- ============================================================================
-- Foreign Key Constraints (Referential Integrity)
-- ============================================================================

-- Occurrence → Paper (an occurrence belongs to one paper)
ALTER TABLE `Occurrence`
  ADD CONSTRAINT `fk_occurrence_paper`
  FOREIGN KEY (`paper_id`) REFERENCES `Paper` (`paper_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Occurrence_Staff → Occurrence (junction table to occurrences)
ALTER TABLE `Occurrence_Staff`
  ADD CONSTRAINT `fk_occstaff_occurrence`
  FOREIGN KEY (`occurrence_id`) REFERENCES `Occurrence` (`occurrence_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Occurrence_Staff → Staff (junction table to staff)
ALTER TABLE `Occurrence_Staff`
  ADD CONSTRAINT `fk_occstaff_staff`
  FOREIGN KEY (`staff_id`) REFERENCES `Staff` (`staff_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ============================================================================
-- Unique Constraints (Prevent Duplicates)
-- ============================================================================

-- Prevent duplicate offerings of the same paper in the same year/trimester
ALTER TABLE `Occurrence`
  ADD UNIQUE KEY `uk_paper_year_trimester` (`paper_id`, `year`, `trimester`);

-- ============================================================================
-- Performance Indexes (Speed up common queries)
-- ============================================================================

-- Index for filtering by year (common in search)
CREATE INDEX `idx_occurrence_year` ON `Occurrence` (`year`);

-- Index for filtering by trimester (common in search)
CREATE INDEX `idx_occurrence_trimester` ON `Occurrence` (`trimester`);

-- Composite index for year + trimester (common combination)
CREATE INDEX `idx_occurrence_year_trimester` ON `Occurrence` (`year`, `trimester`);

-- Index for student count range queries
CREATE INDEX `idx_occurrence_students` ON `Occurrence` (`num_students`);

-- Index for pass rate range queries
CREATE INDEX `idx_occurrence_pass_rate` ON `Occurrence` (`pass_rate`);

-- Index for staff name searches
CREATE INDEX `idx_staff_name` ON `Staff` (`name`);

-- ============================================================================
-- Verification Message
-- ============================================================================

SELECT 'All constraints and indexes added successfully!' AS 'Status';
