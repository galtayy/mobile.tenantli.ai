-- Add move-out specific columns to property_rooms table
ALTER TABLE property_rooms 
ADD COLUMN move_out_notes TEXT NULL AFTER is_completed,
ADD COLUMN move_out_photo_count INT DEFAULT 0 AFTER move_out_notes,
ADD COLUMN move_out_completed BOOLEAN DEFAULT FALSE AFTER move_out_photo_count,
ADD COLUMN move_out_date DATETIME NULL AFTER move_out_completed;