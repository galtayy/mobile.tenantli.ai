// Script to remove multiple properties per user, keeping only the most recent one
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function cleanupMultipleProperties() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  try {
    console.log('Starting cleanup of multiple properties...');
    
    // First, get all users who have more than one property
    const [users] = await connection.execute(`
      SELECT user_id, COUNT(*) as property_count
      FROM properties
      GROUP BY user_id
      HAVING property_count > 1
    `);
    
    console.log(`Found ${users.length} users with multiple properties`);
    
    // For each user with multiple properties
    for (const user of users) {
      console.log(`\nProcessing user ${user.user_id} with ${user.property_count} properties...`);
      
      // Get all properties for this user, ordered by created_at DESC (newest first)
      const [properties] = await connection.execute(`
        SELECT id, address, unit_number, created_at
        FROM properties
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [user.user_id]);
      
      console.log(`Properties for user ${user.user_id}:`);
      properties.forEach((prop, index) => {
        console.log(`  ${index + 1}. ID: ${prop.id}, Address: ${prop.address}, Unit: ${prop.unit_number}, Created: ${prop.created_at}`);
      });
      
      // Keep the newest property (first in the list)
      const propertyToKeep = properties[0];
      console.log(`Keeping property ID: ${propertyToKeep.id} (${propertyToKeep.address})`);
      
      // Delete all other properties
      for (let i = 1; i < properties.length; i++) {
        const propertyToDelete = properties[i];
        console.log(`Deleting property ID: ${propertyToDelete.id} (${propertyToDelete.address})`);
        
        // Delete property - this will cascade delete related records (photos, reports, etc.)
        await connection.execute(`
          DELETE FROM properties
          WHERE id = ?
        `, [propertyToDelete.id]);
      }
      
      console.log(`Completed cleanup for user ${user.user_id}`);
    }
    
    // Verify the cleanup
    console.log('\n--- Verification ---');
    const [verification] = await connection.execute(`
      SELECT user_id, COUNT(*) as property_count
      FROM properties
      GROUP BY user_id
      HAVING property_count > 1
    `);
    
    if (verification.length === 0) {
      console.log('✅ Success! All users now have only one property');
    } else {
      console.log(`⚠️ Warning: Still found ${verification.length} users with multiple properties`);
    }
    
    // Show final stats
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        COUNT(*) as total_properties
      FROM properties
    `);
    
    console.log('\n--- Final Statistics ---');
    console.log(`Total users with properties: ${stats[0].total_users}`);
    console.log(`Total properties: ${stats[0].total_properties}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await connection.end();
  }
}

// Run the cleanup
cleanupMultipleProperties()
  .then(() => {
    console.log('\nCleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nCleanup failed:', error);
    process.exit(1);
  });