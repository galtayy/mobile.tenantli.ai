const db = require('../config/database');

async function migratePhotos() {
  try {
    console.log('Starting photo migration...');
    
    // Add move_out column if it doesn't exist
    await db.execute(`
      ALTER TABLE photos ADD COLUMN move_out BOOLEAN DEFAULT FALSE AFTER property_id;
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('move_out column already exists');
      } else {
        throw err;
      }
    });
    
    // Add indexes
    await db.execute(`
      ALTER TABLE photos ADD INDEX idx_move_out (move_out);
    `).catch(err => {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('idx_move_out index already exists');
      } else {
        throw err;
      }
    });
    
    await db.execute(`
      ALTER TABLE photos ADD INDEX idx_property_room_move_out (property_id, room_id, move_out);
    `).catch(err => {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('idx_property_room_move_out index already exists');
      } else {
        throw err;
      }
    });
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migratePhotos();