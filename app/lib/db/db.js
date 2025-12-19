"use server";
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import postgres from 'postgres';
import { currentDateStr, mkDateStr } from '../utils';

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
 * it indicates the user got three strikes and failed to complete the game.
 * @param {number | null} milliseconds - time taken to complete the game in milliseconds, null if user failed
 * @param {string} date - date string in YYYY-MM-DD format
 * @returns 
 */
export async function submitDailyScore(milliseconds, date) {
  const session = await getServerSession(authOptions);

  if (session == null) {
    throw new Error('Unauthenticated user tried to submit score');
  }

  console.log(`Submitting daily score for ${session.user.email}: ${milliseconds} ms on ${date}`);

  const result = await sql`
    INSERT INTO daily_scores (user_id, date, milliseconds)
    VALUES ((select id from users where email = ${session.user.email}), ${date}, ${milliseconds})
    ON CONFLICT (user_id, date) DO NOTHING
    RETURNING *;
  `;

  console.log(`Daily score submission result for ${session.user.email}:`, result);

  if (milliseconds !== null)
    console.log(`${session.user.email} submitted a score of ${milliseconds} ms on ${date}`);
  else console.log(`${session.user.email} failed to complete today's game on ${date}`);
  return result.length === 1
}

/**
 * Get the user's current streak information
 * @returns {Promise<{currentStreak: number, longestStreak: number} | null>}
 */
export async function getStreakInfo() {
  const session = await getServerSession(authOptions);

  if (session == null) {
    return null;
  }

  const result = await sql`
    SELECT current_streak_length, longest_streak_length, current_streak_last_date
    FROM streaks
    WHERE user_id = (select id from users where email = ${session.user.email})
  `;

  if (result.length !== 1) {
    throw new Error('Error fetching streak for user ' + session.user.email);
  } else {
    return {
      streak: result[0].current_streak_last_date === currentDateStr() ? 0 : result[0].current_streak_length,
      longestStreak: result[0].longest_streak_length
    }
  }

}

/**
 * Update the user's streak after completing today's puzzle
 * @param {boolean} completed - whether the user completed the puzzle (true) or failed (false)
 * @param {string} date - date string in YYYY-MM-DD format
 * @returns {Promise<{current_streak_length: number, longest_streak_length: number}>}
 */
export async function updateStreak(completed, date) {
  const session = await getServerSession(authOptions);

  if (session == null) {
    throw new Error('Unauthenticated user tried to update streak');
  }

  // make the string for yesterday's date
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const yesterdayObj = new Date(dateObj);
  yesterdayObj.setUTCDate(yesterdayObj.getUTCDate() - 1);
  const yesterdayStr = mkDateStr(yesterdayObj);

  // behold my SQL wizardry
  // jk AI helped me write this
  // it updates the user's streak based on whether they completed today's puzzle
  const result = await sql`
    INSERT INTO streaks (user_id, current_streak_length, longest_streak_length, current_streak_last_date)
    VALUES (
      (SELECT id FROM users WHERE email = ${session.user.email}),
      CASE WHEN ${completed} THEN 1 ELSE 0 END,
      CASE WHEN ${completed} THEN 1 ELSE 0 END,
      CASE WHEN ${completed} THEN ${date}::date ELSE NULL END
    )
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak_length = CASE
        WHEN ${completed} AND streaks.current_streak_last_date = ${yesterdayStr}::date THEN streaks.current_streak_length + 1
        WHEN ${completed} THEN 1
        ELSE 0
      END,
      longest_streak_length = GREATEST(
        streaks.longest_streak_length,
        CASE
          WHEN ${completed} AND streaks.current_streak_last_date = ${yesterdayStr}::date THEN streaks.current_streak_length + 1
          WHEN ${completed} THEN 1
          ELSE 0
        END
      ),
      current_streak_last_date = CASE WHEN ${completed} THEN ${date}::date ELSE streaks.current_streak_last_date END
    RETURNING current_streak_length, longest_streak_length;
  `;

  console.log(`Updated streak for ${session.user.email}:`, result[0]);

  return result[0];
}

