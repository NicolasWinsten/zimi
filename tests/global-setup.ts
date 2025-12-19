/**
 * Global setup for Playwright tests
 * Runs once before all tests to prepare the test database
 */

import { setupTestDatabase } from './db-test-setup';

export default async function globalSetup() {
  console.log('\n🚀 Running global test setup...\n');
  
  try {
    await setupTestDatabase();
    console.log('\n✅ Global setup complete\n');
  } catch (error) {
    console.error('\n❌ Global setup failed:', error);
    throw error;
  }
}
