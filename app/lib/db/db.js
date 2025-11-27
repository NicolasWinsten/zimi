"use server";
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

async function getUser(id) {
  const [user] = await sql`
    SELECT *
    FROM users
    WHERE id = ${id}
  `;
  return user;
}

export async function getTopScores(limit = 10) {
  const scores = await sql`
    SELECT user_id, milliseconds
    FROM daily_scores
    WHERE date = CURRENT_DATE
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