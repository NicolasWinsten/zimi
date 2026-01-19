/**
 * Global teardown for Playwright tests
 * Runs once after all tests finish
 * Clears test data and closes database connection
 */

import { clearTestData, closeDatabaseConnection } from './db-test-setup';

async function globalTeardown() {
  console.log('🧹 Global teardown: clearing test database and closing connection...');
  try {
    await clearTestData();
    console.log('✓ Database cleared successfully');
    
    await closeDatabaseConnection();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('✗ Error during teardown:', error);
    throw error;
  }
}

export default globalTeardown;
