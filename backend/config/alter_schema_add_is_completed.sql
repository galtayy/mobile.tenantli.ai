-- Add is_completed column to property_rooms table
ALTER TABLE property_rooms 
ADD COLUMN is_completed BOOLEAN DEFAULT FALSE
AFTER photo_count;