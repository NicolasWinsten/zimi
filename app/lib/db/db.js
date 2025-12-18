"use server";
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

export async function getTopScores(limit = 10) {
  const scores = await sql`
    SELECT name, milliseconds
    FROM daily_scores join users on user_id = id
    WHERE date = CURRENT_DATE and milliseconds IS NOT NULL
    ORDER BY milliseconds
    LIMIT ${limit}
  `;
  return scores;
}

/**
 * Submit how long the user took to finish today's game. If the given time is null,
 * it indicates the user did got three strikes and failed to complete the game.
 * @param {number} milliseconds 
 * @returns 
 */
export async function submitDailyScore(milliseconds) {
  const session = await getServerSession(authOptions);

  if (session == null) {
    throw new Error('User not authenticated');
  }

  const result = await sql`
    INSERT INTO daily_scores (user_id, date, milliseconds)
    VALUES ((select id from users where email = ${session.user.email}), CURRENT_DATE, ${milliseconds})
    ON CONFLICT (user_id, date) DO NOTHING
    RETURNING *;
  `;

  if (milliseconds !== null)
    console.log(`${session.user.email} submitted a score of ${milliseconds} ms on ${new Date().toISOString().split('T')[0]}`);
  else console.log(`${session.user.email} failed to complete today's game on ${new Date().toISOString().split('T')[0]}`);
  return result 
}

/**
 * Get the user's current streak information
 * @returns {Promise<{current_streak_length: number, longest_streak_length: number, current_streak_last_date: string} | null>}
 */
export async function getStreak() {
  const session = await getServerSession(authOptions);

  if (session == null) {
    return null;
  }

  const result = await sql`
    SELECT current_streak_length, longest_streak_length, current_streak_last_date
    FROM streaks
    WHERE user_id = (select id from users where email = ${session.user.email})
  `;

  return result.length > 0 ? result[0] : null;
}

/**
 * Update the user's streak after completing today's puzzle
 * @param {boolean} completed - whether the user completed the puzzle (true) or failed (false)
 * @returns {Promise<{current_streak_length: number, longest_streak_length: number}>}
 */
export async function updateStreak(completed) {
  const session = await getServerSession(authOptions);

  if (session == null) {
    throw new Error('User not authenticated');
  }

  const userId = await sql`select id from users where email = ${session.user.email}`;
  
  if (userId.length === 0) {
    throw new Error('User not found');
  }

  const userIdValue = userId[0].id;

  // Get current streak data
  const currentStreak = await sql`
    SELECT current_streak_length, longest_streak_length, current_streak_last_date
    FROM streaks
    WHERE user_id = ${userIdValue}
  `;

  let newStreakLength = 1;
  let longestStreak = 1;

  if (completed) {
    if (currentStreak.length > 0) {
      const lastDate = currentStreak[0].current_streak_last_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if last completion was yesterday
      if (lastDate === yesterdayStr) {
        // Continue the streak
        newStreakLength = currentStreak[0].current_streak_length + 1;
      } else if (lastDate === new Date().toISOString().split('T')[0]) {
        // Already completed today, don't update
        return {
          current_streak_length: currentStreak[0].current_streak_length,
          longest_streak_length: currentStreak[0].longest_streak_length,
        };
      }
      // If last date is neither yesterday nor today, streak resets to 1
      
      longestStreak = Math.max(newStreakLength, currentStreak[0].longest_streak_length);
    }

    // Update or insert streak
    const result = await sql`
      INSERT INTO streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
      VALUES (${userIdValue}, ${newStreakLength}, ${longestStreak}, CURRENT_DATE)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        current_streak_length = ${newStreakLength},
        longest_streak_length = ${longestStreak},
        current_streak_last_date = CURRENT_DATE
      RETURNING current_streak_length, longest_streak_length;
    `;

    console.log(`${session.user.email} streak updated: ${newStreakLength} (longest: ${longestStreak})`);
    return result[0];
  } else {
    // Failed to complete - reset streak to 0
    if (currentStreak.length > 0) {
      await sql`
        UPDATE streaks
        SET current_streak_length = 0,
            current_streak_last_date = CURRENT_DATE
        WHERE user_id = ${userIdValue}
      `;
      return {
        current_streak_length: 0,
        longest_streak_length: currentStreak[0].longest_streak_length,
      };
    } else {
      // No existing streak record, insert with 0
      await sql`
        INSERT INTO streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
        VALUES (${userIdValue}, 0, 0, CURRENT_DATE)
      `;
      return {
        current_streak_length: 0,
        longest_streak_length: 0,
      };
    }
  }
}

// async function seedUsers() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
//   await sql`
//     CREATE TABLE IF NOT EXISTS users (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email TEXT NOT NULL UNIQUE,
//       password TEXT NOT NULL
//     );
//   `;

//   const insertedUsers = await Promise.all(
//     users.map(async (user) => {
//       const hashedPassword = await bcrypt.hash(user.password, 10);
//       return sql`
//         INSERT INTO users (id, name, email, password)
//         VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
//         ON CONFLICT (id) DO NOTHING;
//       `;
//     }),
//   );

//   return insertedUsers;
// }

// async function seedInvoices() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS invoices (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       customer_id UUID NOT NULL,
//       amount INT NOT NULL,
//       status VARCHAR(255) NOT NULL,
//       date DATE NOT NULL
//     );
//   `;

//   const insertedInvoices = await Promise.all(
//     invoices.map(
//       (invoice) => sql`
//         INSERT INTO invoices (customer_id, amount, status, date)
//         VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedInvoices;
// }

// async function seedCustomers() {
//   await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

//   await sql`
//     CREATE TABLE IF NOT EXISTS customers (
//       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       image_url VARCHAR(255) NOT NULL
//     );
//   `;

//   const insertedCustomers = await Promise.all(
//     customers.map(
//       (customer) => sql`
//         INSERT INTO customers (id, name, email, image_url)
//         VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
//         ON CONFLICT (id) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedCustomers;
// }

// async function seedRevenue() {
//   await sql`
//     CREATE TABLE IF NOT EXISTS revenue (
//       month VARCHAR(4) NOT NULL UNIQUE,
//       revenue INT NOT NULL
//     );
//   `;

//   const insertedRevenue = await Promise.all(
//     revenue.map(
//       (rev) => sql`
//         INSERT INTO revenue (month, revenue)
//         VALUES (${rev.month}, ${rev.revenue})
//         ON CONFLICT (month) DO NOTHING;
//       `,
//     ),
//   );

//   return insertedRevenue;
// }