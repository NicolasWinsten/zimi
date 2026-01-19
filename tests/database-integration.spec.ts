/**
 * Database integration tests
 * Simulates playing games and verifies database updates (scores and streaks)
 * 
 * Note: These tests verify that game completion triggers proper database updates
 * through the real API endpoints. Database assertions are done via direct queries.
 */

import { test, expect } from '@playwright/test';
import {
  insertStreakData,
  verifyScoreSubmitted,
  verifyScoreValue,
  verifyStreak,
  verifyUserExistsByEmail,
} from './db-test-setup';
import { closeAllDialogs, closeHowToDialog, getTileByCharacter, loginTestUser } from './helpers';
import { currentDateStr, mkDateStr } from '../app/lib/utils';

test.describe('Database Integration - Score and Streak Submission', () => {
  test('scenario 1: new user completes puzzle and score is saved', async ({ page }) => {
    const testUser = {
      name: 'New Game Player',
      email: `new-player-${Date.now()}@test.example.com`,
    };

    const today = currentDateStr();

    // Step 1: Go to main page and login (creates user via NextAuth)
    await page.goto('/');
    await closeHowToDialog(page);
    await loginTestUser(page, testUser.email, testUser.name);

    // Step 2: Play a simple 2-word game
    // Using 结婚 (2 tiles, 1 pair to match)
    console.log('[TEST] Playing game with words: 结婚');
    await page.goto('/?dev=true&words=结婚');
    await closeHowToDialog(page);

    // Step 3: Match the tiles to complete the game
    await getTileByCharacter(page, '结').click();
    await getTileByCharacter(page, '婚').click();

    // Wait for the submission to complete
    // Look for any success message or wait for the streak popup
    await page.waitForTimeout(2000);

    // Step 4: Verify the user was created in the database
    console.log('[TEST] Verifying user exists with email:', testUser.email);
    const userExists = await verifyUserExistsByEmail(testUser.email);
    console.log('[TEST] User exists:', userExists);
    expect(userExists).toBe(true);

    // Step 5: Verify the score was submitted for today
    console.log('[TEST] Verifying score submitted for date:', today);
    const scoreSubmitted = await verifyScoreSubmitted(testUser.email, today);
    console.log('[TEST] Score submitted:', scoreSubmitted);
    expect(scoreSubmitted).toBe(true);

    // Step 6: Verify the streak was created with current and longest streak of 1
    const streakVerified = await verifyStreak(testUser.email, 1, 1, today);
    expect(streakVerified).toBe(true);
  });

  test('scenario 2: existing user completes second puzzle and streak increments', async ({ page }) => {
    const testUser = {
      name: 'Streak Player',
      email: `streak-player-${Date.now()}@test.example.com`,
    };

    // Calculate yesterday's date
    const today = currentDateStr();
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = mkDateStr(yesterday);

    // Step 1: Go to main page and login
    await page.goto('/');
    await closeHowToDialog(page);
    await loginTestUser(page, testUser.email, testUser.name);

    // Step 2: Play game on yesterday's date to establish initial streak
    // This simulates the user completing yesterday's puzzle
    await page.goto(`/?dev=true&words=别人&date=${yesterdayStr}`);
    await closeHowToDialog(page);

    await getTileByCharacter(page, '别').click();
    await getTileByCharacter(page, '人').click();
    await page.waitForTimeout(2000);

    // Step 3: Verify yesterday's score was recorded
    const yesterdayScore = await verifyScoreSubmitted(testUser.email, yesterdayStr);
    expect(yesterdayScore).toBe(true);

    // Step 5: Play today's game to continue the streak
    await page.goto('/?dev=true&words=结婚');
    await closeHowToDialog(page);

    await getTileByCharacter(page, '结').click();
    await getTileByCharacter(page, '婚').click();
    await page.waitForTimeout(2000);

    // Step 6: Verify today's score was submitted
    const todayScore = await verifyScoreSubmitted(testUser.email, today);
    expect(todayScore).toBe(true);

    // Step 7: Verify streak was incremented to 2
    // The streak should be 2 because user completed yesterday and today
    const streakVerified = await verifyStreak(testUser.email, 2, 2, today);
    expect(streakVerified).toBe(true);
  });

  test('scenario 3: user fails puzzle (3 strikes) and streak is reset', async ({ page }) => {
    const testUser = {
      name: 'Strike User',
      email: `strike-player-${Date.now()}@test.example.com`,
    };

    const today = currentDateStr();
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = mkDateStr(yesterday);

    // Step 1: Login
    await page.goto('/');
    await closeHowToDialog(page);
    await loginTestUser(page, testUser.email, testUser.name);

    // Step 1.5: Insert streak data to simulate existing streak of 3
    await insertStreakData(testUser.email, 3, 5, yesterdayStr);

    // Step 2: Play game with multiple pairs
    // Using a 4-word puzzle (8 tiles, 4 pairs) so we have time to make 3 wrong matches
    await page.goto('/?dev=true&words=结婚,别人,男生,马上');
    await closeHowToDialog(page);

    // Step 3: Make 3 intentional wrong matches to get 3 strikes and fail
    // Strike 1: wrong pair
    await getTileByCharacter(page, '结').click();
    await getTileByCharacter(page, '别').click();
    await page.waitForTimeout(700); // Wait for shake animation and deselection

    // Strike 2: wrong pair
    await getTileByCharacter(page, '人').click();
    await getTileByCharacter(page, '男').click();
    await page.waitForTimeout(700);

    // Strike 3: wrong pair (this should end the game)
    await getTileByCharacter(page, '生').click();
    await getTileByCharacter(page, '马').click();
    await page.waitForTimeout(2000); // Wait for game over state and submission

    // Step 4: Verify score was submitted with null milliseconds (indicating failure)
    const scoreSubmitted = await verifyScoreSubmitted(testUser.email, today);
    expect(scoreSubmitted).toBe(true);

    const scoreIsNull = await verifyScoreValue(testUser.email, today, null);
    expect(scoreIsNull).toBe(true);

    // Step 5: Verify streak was reset to 0 due to failure
    const streakVerified = await verifyStreak(testUser.email, 0, 5, null);
    expect(streakVerified).toBe(true);
  });

  test('scenario 4: user completes puzzle and updates expired streak', async ({ page }) => {
    const testUser = {
      name: 'Expired Streak Player',
      email: `expired-streak-${Date.now()}@test.example.com`,
    };

    // Calculate dates
    const today = currentDateStr();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
    const twoDaysAgoStr = mkDateStr(twoDaysAgo);

    // Step 1: Login
    await page.goto('/');
    await closeHowToDialog(page);
    await loginTestUser(page, testUser.email, testUser.name);

    // Step 2: Insert old streak data to simulate an expired streak
    // User had a streak of 7 days, but last completed 2 days ago (streak is expired)
    await insertStreakData(testUser.email, 7, 10, twoDaysAgoStr);

    // Step 3: Play today's game to resume with a new streak
    await page.goto('/?dev=true&words=结婚');
    await closeHowToDialog(page);

    await getTileByCharacter(page, '结').click();
    await getTileByCharacter(page, '婚').click();
    await page.waitForTimeout(2000);

    // Step 4: Verify today's score was submitted
    const scoreSubmitted = await verifyScoreSubmitted(testUser.email, today);
    expect(scoreSubmitted).toBe(true);

    // Step 5: Verify streak was reset to 1 (expired streak resets)
    // Current streak should be 1 (fresh start today)
    // Longest streak should remain 10 (historical max)
    // Last date should be today
    const streakVerified = await verifyStreak(testUser.email, 1, 10, today);
    expect(streakVerified).toBe(true);
  });

  test('scenario 5: user completes puzzle before login, then logs in and score/streak are saved', async ({ page }) => {
    const testUser = {
      name: 'Login After Play Player',
      email: `login-after-${Date.now()}@test.example.com`,
    };

    const today = currentDateStr();
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = mkDateStr(yesterday);

    // Step 1: Go to main page and login to create the user
    await page.goto('/');
    await closeHowToDialog(page);
    await loginTestUser(page, testUser.email, testUser.name);

    // Step 2: Seed the database with streak data (simulate previous play)
    await insertStreakData(testUser.email, 2, 5, yesterdayStr);

    // Step 3: Log out by clearing cookies and reloading
    await page.context().clearCookies();
    
    // Step 4: Play game without being logged in (anonymous play)
    // The game state will be stored locally
    await page.goto('/?dev=true&words=结婚');
    await closeHowToDialog(page);

    await getTileByCharacter(page, '结').click();
    await getTileByCharacter(page, '婚').click();
    await page.waitForTimeout(2000);

    // Step 5: Log back in
    // This should trigger the score submission and streak update
    await closeAllDialogs(page);
    await loginTestUser(page, testUser.email, testUser.name);

    await page.waitForTimeout(2000); // Wait for any submissions to complete
    // Step 6: Verify the score was submitted for today
    const scoreSubmitted = await verifyScoreSubmitted(testUser.email, today);
    expect(scoreSubmitted).toBe(true);

    // Step 7: Verify the streak was incremented to 3 (continued from yesterday's streak of 2)
    // Current streak should be 3 (yesterday was 2, today continues it)
    // Longest streak should remain 5 (historical max)
    // Last date should be today
    const streakVerified = await verifyStreak(testUser.email, 3, 5, today);
    expect(streakVerified).toBe(true);
  });

});
