-- Add move_out column to photos table to distinguish between move-in and move-out photos
ALTER TABLE photos ADD COLUMN move_out BOOLEAN DEFAULT FALSE AFTER property_id;

-- Add index for better query performance
ALTER TABLE photos ADD INDEX idx_move_out (move_out);
ALTER TABLE photos ADD INDEX idx_property_room_move_out (property_id, room_id, move_out);