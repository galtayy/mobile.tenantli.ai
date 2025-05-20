// Check column types in database
const db = require('./config/database');

async function checkColumnTypes() {
  try {
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'property_rooms' 
      AND COLUMN_NAME IN ('move_out_date', 'move_out_notes', 'timestamp')
    `);
    
    console.log('Column information:');
    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.COLUMN_TYPE}) - Nullable: ${col.IS_NULLABLE}`);
    });
    
    // Check a sample date format
    const testDate = new Date().toISOString();
    const mysqlDate = testDate.slice(0, 19).replace('T', ' ');
    console.log('\nDate format test:');
    console.log('JavaScript ISO:', testDate);
    console.log('MySQL format:', mysqlDate);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkColumnTypes();