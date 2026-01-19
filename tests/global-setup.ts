/**
 * Global setup for Playwright tests
 * Runs once before all tests start
 * Clears test data to ensure a clean slate
 */

import { clearTestData } from './db-test-setup';

async function globalSetup() {
  console.log('🧹 Global setup: clearing test database...');
  try {
    await clearTestData();
    console.log('✓ Database cleared successfully');
  } catch (error) {
    console.error('✗ Error clearing database:', error);
    throw error;
  }
}

export default globalSetup;
