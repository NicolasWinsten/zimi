/**
 * Database test setup script
 * Seeds a test database with users, streaks, and daily scores for testing
 */

import postgres from 'postgres';

const dbUrl = process.env.DATABASE_URL || '';
console.log('Connecting to database at:', dbUrl);
const sql = postgres(dbUrl, { ssl: 'require' });

/**
 * Create database tables if they don't exist
 */
// export async function createTables() {
//   try {
//     // Create users table
//     await sql`
//       CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email TEXT NOT NULL UNIQUE,
//         "emailVerified" TIMESTAMP,
//         image TEXT
//       )
//     `;

//     // Create daily_scores table
//     await sql`
//       CREATE TABLE IF NOT EXISTS daily_scores (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         date DATE NOT NULL,
//         milliseconds INTEGER,
//         UNIQUE(user_id, date)
//       )
//     `;

//     // Create streaks table
//     await sql`
//       CREATE TABLE IF NOT EXISTS streaks (
//         id SERIAL PRIMARY KEY,
//         user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
//         current_streak_length INTEGER DEFAULT 0,
//         longest_streak_length INTEGER DEFAULT 0,
//         current_streak_last_date DATE
//       )
//     `;

//     console.log('✓ Database tables created');
//   } catch (error) {
//     console.error('Error creating tables:', error);
//     throw error;
//   }
// }

export interface TestUser {
  id: number
  name: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
}

/**
 * Clear all test data from tables
 */
export async function clearTestData() {
  await sql`truncate table users cascade`;
  await sql`truncate table daily_scores cascade`;
  await sql`truncate table streaks cascade`;

  console.log('✓ Cleared test data from database');
}

const newTestUser = (id: number, verified: boolean): TestUser => ({
  id,
  name: `Test User ${id}`,
  email: `test${id}@example.com`,
  emailVerified: verified ? new Date('2024-01-01') : null,
  image: null,
})

/**
 * Seed test users into the database
 */
export async function seedTestUsers(newUsers: TestUser[]) {
  for (const user of newUsers) {
    await sql`
      INSERT INTO users (id, name, email, "emailVerified", image)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${user.emailVerified}, ${user.image})
    `;
  }
  console.log('✓ Seeded test users with IDs:', newUsers.map(u => u.id).join(', '));
}

export async function insertStreakData(email: string, currentStreak: number, longestStreak: number, lastDate: string | null) {
  await sql`
    INSERT INTO streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
    VALUES ((SELECT id FROM users WHERE email = ${email}), ${currentStreak}, ${longestStreak}, ${lastDate})
  `;
}

/**
 * 
 * @param userId 
 * @param date date should be of form YYYY-MM-DD
 * @param milliseconds null indicates a missed day 
 */
export async function insertDailyScore(userId: number, date: string, milliseconds: number | null) {
  await sql`
    INSERT INTO daily_scores (user_id, date, milliseconds)
    VALUES (${userId}, ${date}, ${milliseconds})
  `;
}


/**
 * Setup all test data
 */
// export async function setupTestDatabase() {
//   try {
//     console.log('Setting up test database...');
//     // await createTables();
//     await clearTestData();
//     // await seedTestUsers();
//     // await seedTestStreaks();
//     // await seedTestDailyScores();
//     console.log('✓ Test database setup complete');
//   } catch (error) {
//     console.error('Error setting up test database:', error);
//     throw error;
//   }
// }

export async function verifyUserExists(userId: number): Promise<boolean> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `;
  return result.length === 1;
}

/**
 * Verify that a user exists by email
 */
export async function verifyUserExistsByEmail(email: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result.length === 1;
}

/**
 * Verify that a score was submitted for a user on a specific date
 */
export async function verifyScoreSubmitted(userIdentifier: string | number, date: string): Promise<boolean> {
  let query;
  if (typeof userIdentifier === 'string') {
    // Assume it's an email
    query = sql`
      SELECT * FROM daily_scores
      WHERE user_id = (SELECT id FROM users WHERE email = ${userIdentifier}) AND date = ${date}
    `;
  } else {
    // It's a user ID
    query = sql`
      SELECT * FROM daily_scores
      WHERE user_id = ${userIdentifier} AND date = ${date}
    `;
  }
  const result = await query;
  return result.length === 1;
}

/**
 * Verify that a score has the expected value
 */
export async function verifyScoreValue(email: string, date: string, milliseconds: number | null): Promise<boolean> {
  const result = await sql`
    SELECT * FROM daily_scores
    WHERE user_id = (SELECT id FROM users WHERE email = ${email}) AND date = ${date} AND milliseconds IS NOT DISTINCT FROM ${milliseconds}
  `;
  return result.length === 1;
}

/**
 * Get a user's current streak
 */
export async function getUserStreak(userIdentifier: string | number) {
  let query;
  if (typeof userIdentifier === 'string') {
    // Assume it's an email
    query = sql`
      SELECT user_id, current_streak_length, longest_streak_length,
      date(current_streak_last_date) as current_streak_last_date
      FROM streaks WHERE user_id = (SELECT id FROM users WHERE email = ${userIdentifier})
    `;
  } else {
    // It's a user ID
    query = sql`
      SELECT user_id, current_streak_length, longest_streak_length,
      date(current_streak_last_date) as current_streak_last_date
      FROM streaks WHERE user_id = ${userIdentifier}
    `;
  }
  const result = await query;
  return result.length > 0 ? result[0] : null;
}

/**
 * Verify that a user's streak matches expected values
 */
export async function verifyStreak(
  userIdentifier: string | number,
  expectedCurrentStreak: number,
  expectedLongestStreak: number,
  expectedLastDate: string | null
): Promise<boolean> {
  const streak = await getUserStreak(userIdentifier);
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
