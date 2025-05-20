-- DepositShield alter schema for lease document fields
USE depositshield_db;

-- Add lease_document_url column
SET @dbname = DATABASE();
SET @tablename = "properties";

-- Check and add lease_document_url
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'lease_document_url';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN lease_document_url VARCHAR(500) NULL AFTER lease_duration_type',
  'SELECT "lease_document_url column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add lease_document_name
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'lease_document_name';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN lease_document_name VARCHAR(255) NULL AFTER lease_document_url',
  'SELECT "lease_document_name column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;