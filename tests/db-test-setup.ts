/**
 * Database test setup script
 * Seeds a test database with users, streaks, and daily scores for testing
 */

import postgres from 'postgres';

// Test database connection - use default import
const dbUrl = process.env.TEST_DATABASE_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  throw new Error('TEST_DATABASE_URL or POSTGRES_URL environment variable must be set for database tests');
}
const sql = postgres(dbUrl, { ssl: 'require' });

export interface TestUser {
  id: number;
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}

export const testUsers: TestUser[] = [
  {
    id: 1,
    name: 'Test User One',
    email: 'test1@example.com',
    emailVerified: new Date('2024-01-01'),
    image: null,
  },
  {
    id: 2,
    name: 'Test User Two',
    email: 'test2@example.com',
    emailVerified: new Date('2024-01-01'),
    image: null,
  },
  {
    id: 3,
    name: 'Test User Three',
    email: 'test3@example.com',
    emailVerified: null,
    image: null,
  },
];

/**
 * Clear all test data from tables
 */
export async function clearTestData() {
  await sql`DELETE FROM daily_scores WHERE user_id IN (1, 2, 3)`;
  await sql`DELETE FROM streaks WHERE user_id IN (1, 2, 3)`;
  await sql`DELETE FROM users WHERE id IN (1, 2, 3)`;
}

/**
 * Seed test users into the database
 */
export async function seedTestUsers() {
  for (const user of testUsers) {
    await sql`
      INSERT INTO users (id, name, email, "emailVerified", image)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.emailVerified}, ${user.image})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        "emailVerified" = EXCLUDED."emailVerified",
        image = EXCLUDED.image
    `;
  }
  console.log('✓ Seeded test users');
}

/**
 * Seed test streaks into the database
 */
export async function seedTestStreaks() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // User 1: Has a 3-day streak (completed yesterday)
  await sql`
    INSERT INTO streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
    VALUES (1, 3, 5, ${yesterday.toISOString().split('T')[0]})
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak_length = EXCLUDED.current_streak_length,
      longest_streak_length = EXCLUDED.longest_streak_length,
      current_streak_last_date = EXCLUDED.current_streak_last_date
  `;

  // User 2: Has a 1-day streak (completed two days ago, so streak will reset)
  await sql`
    INSERT INTO streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
    VALUES (2, 1, 10, ${twoDaysAgo.toISOString().split('T')[0]})
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak_length = EXCLUDED.current_streak_length,
      longest_streak_length = EXCLUDED.longest_streak_length,
      current_streak_last_date = EXCLUDED.current_streak_last_date
  `;

  console.log('✓ Seeded test streaks');
}

/**
 * Seed test daily scores into the database
 */
export async function seedTestDailyScores() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // User 1: Completed puzzles for the last 3 days
  await sql`
    INSERT INTO daily_scores (user_id, date, milliseconds)
    VALUES 
      (1, ${threeDaysAgo.toISOString().split('T')[0]}, 45000),
      (1, ${twoDaysAgo.toISOString().split('T')[0]}, 42000),
      (1, ${yesterday.toISOString().split('T')[0]}, 38000)
    ON CONFLICT (user_id, date) DO NOTHING
  `;

  // User 2: Completed puzzle two days ago only
  await sql`
    INSERT INTO daily_scores (user_id, date, milliseconds)
    VALUES (2, ${twoDaysAgo.toISOString().split('T')[0]}, 50000)
    ON CONFLICT (user_id, date) DO NOTHING
  `;

  console.log('✓ Seeded test daily scores');
}

/**
 * Setup all test data
 */
export async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');
    await clearTestData();
    await seedTestUsers();
    await seedTestStreaks();
    await seedTestDailyScores();
    console.log('✓ Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
}

/**
 * Verify that a score was submitted for a user on a specific date
 */
export async function verifyScoreSubmitted(userId: number, date: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM daily_scores
    WHERE user_id = ${userId} AND date = ${date}
  `;
  return result.length === 1;
}

/**
 * Verify that a score has the expected value
 */
export async function verifyScoreValue(userId: number, date: string, milliseconds: number | null): Promise<boolean> {
  const result = await sql`
    SELECT * FROM daily_scores
    WHERE user_id = ${userId} AND date = ${date} AND milliseconds IS NOT DISTINCT FROM ${milliseconds}
  `;
  return result.length === 1;
}

/**
 * Get a user's current streak
 */
export async function getUserStreak(userId: number) {
  const result = await sql`
    SELECT * FROM streaks WHERE user_id = ${userId}
  `;
  return result.length > 0 ? result[0] : null;
}

/**
 * Verify that a user's streak matches expected values
 */
export async function verifyStreak(
  userId: number,
  expectedCurrentStreak: number,
  expectedLongestStreak: number,
  expectedLastDate?: string
): Promise<boolean> {
  const streak = await getUserStreak(userId);
  if (!streak) return false;

  const currentMatches = streak.current_streak_length === expectedCurrentStreak;
  const longestMatches = streak.longest_streak_length === expectedLongestStreak;
  
  // Handle date comparison - could be Date object or string from database
  let dateMatches = true;
  if (expectedLastDate) {
    const lastDateStr = streak.current_streak_last_date instanceof Date 
      ? streak.current_streak_last_date.toISOString().split('T')[0]
      : String(streak.current_streak_last_date).split('T')[0];
    dateMatches = lastDateStr === expectedLastDate;
  }

  return currentMatches && longestMatches && dateMatches;
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection() {
  await sql.end();
}
