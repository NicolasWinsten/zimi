/**
 * End-to-end tests for streak tracking with database integration
 * Tests the complete flow of completing puzzles, tracking streaks, and submitting scores
 */

import { test, expect, Page } from '@playwright/test';
import { closeHowToDialog, getTileByCharacter } from './helpers';
import { 
  testUsers, 
  verifyScoreSubmitted, 
  verifyScoreValue,
  verifyStreak,
  getUserStreak,
  setupTestDatabase
} from './db-test-setup';

// Helper function to mock NextAuth session
async function mockAuthSession(page: Page, userId: number) {
  const user = testUsers.find(u => u.id === userId);
  if (!user) throw new Error(`User ${userId} not found`);

  await page.route('**/api/auth/session', route => {
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expires: '2099-12-31T23:59:59.999Z',
      }),
    });
  });
}

// Helper function to complete a simple 2-character puzzle
async function completePuzzle(page: Page, word: string) {
  await closeHowToDialog(page);
  
  const char1 = getTileByCharacter(page, word[0]);
  const char2 = getTileByCharacter(page, word[1]);
  
  await char1.click();
  await char2.click();
  
  // Wait for tiles to be matched
  await expect(char1).toHaveAttribute('data-match-color', /.+/);
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to wait for score to be recorded in database
async function waitForScoreRecorded(userId: number, date: string, maxWaitMs: number = 3000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (await verifyScoreSubmitted(userId, date)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return false;
}

test.describe('Streak Tracking - Authenticated User (Already Logged In)', () => {
  test.beforeEach(async ({ page }) => {
    // Reset test database before each test
    await setupTestDatabase();
    
    // Mock authentication for User 1 (has 3-day streak, completed yesterday)
    await mockAuthSession(page, 1);
  });

  test('should submit score and update streak when authenticated user completes puzzle', async ({ page }) => {
    const today = getTodayDateString();
    
    // Navigate to game with simple 2-character word
    await page.goto('/?dev=true&words=你好&preventRestore=true');
    
    // Complete the puzzle
    await completePuzzle(page, '你好');
    
    // Wait for streak popup to appear
    await expect(page.getByTestId('streak-popup')).toBeVisible({ timeout: 5000 });
    
    // Check that streak length is displayed correctly (should be 4 now: 3 + 1)
    const streakText = await page.getByTestId('streak-length').textContent();
    expect(streakText).toContain('4');
    
    // Wait for score to be recorded in database
    await waitForScoreRecorded(1, today);
    
    // Check that score was submitted
    const scoreSubmitted = await verifyScoreSubmitted(1, today);
    expect(scoreSubmitted).toBe(true);
    
    // Check that streak was updated correctly (3 -> 4)
    const streakValid = await verifyStreak(1, 4, 5, today);
    expect(streakValid).toBe(true);
  });

  test('should not overwrite existing score if user tries to submit twice', async ({ page }) => {
    const today = getTodayDateString();
    
    // First completion
    await page.goto('/?dev=true&words=你好&preventRestore=true');
    await completePuzzle(page, '你好');
    await expect(page.getByTestId('streak-popup')).toBeVisible({ timeout: 5000 });
    await waitForScoreRecorded(1, today);
    
    // Get the first score
    const streak1 = await getUserStreak(1);
    const initialStreak = streak1?.current_streak_length;
    
    // Close streak popup
    await page.getByTestId('streak-popup').click();
    await expect(page.getByTestId('streak-popup')).not.toBeVisible();
    
    // Try to complete again (simulate clearing cookies and playing again)
    await page.goto('/?dev=true&words=测试&preventRestore=true&preventStorage=true');
    await completePuzzle(page, '测试');
    
    // Streak popup should appear again
    await expect(page.getByTestId('streak-popup')).toBeVisible({ timeout: 5000 });
    
    // Give API call a moment to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // But streak should not increase (still same as before)
    const streak2 = await getUserStreak(1);
    expect(streak2?.current_streak_length).toBe(initialStreak);
    
    // Should still only have one score for today
    const scoreSubmitted = await verifyScoreSubmitted(1, today);
    expect(scoreSubmitted).toBe(true);
  });

  test('should reset streak if user misses a day', async ({ page }) => {
    // User 2 has a streak from 2 days ago, so it should reset
    await mockAuthSession(page, 2);
    
    const today = getTodayDateString();
    
    await page.goto('/?dev=true&words=世界&preventRestore=true');
    await completePuzzle(page, '世界');
    
    await expect(page.getByTestId('streak-popup')).toBeVisible({ timeout: 5000 });
    
    // Streak should show 1 (reset because user missed yesterday)
    const streakText = await page.getByTestId('streak-length').textContent();
    expect(streakText).toContain('1');
    
    await waitForScoreRecorded(1, today);
    
    // Verify streak was reset to 1, but longest streak is preserved (10)
    const streakValid = await verifyStreak(2, 1, 10, today);
    expect(streakValid).toBe(true);
  });

  test('should record failed game (3 strikes) with null score', async ({ page }) => {
    const today = getTodayDateString();
    
    await page.goto('/?dev=true&words=你好&preventRestore=true');
    await closeHowToDialog(page);
    
    // Make 3 incorrect guesses to get 3 strikes
    const tiles = await page.getByTestId(/^hanzi-tile-/).all();
    
    // Click first tile, then different non-matching tiles
    await tiles[0].click();
    await tiles[1].click(); // This should create a strike if not matching
    
    // Wait for shake animation to complete
    await page.waitForFunction(() => !document.querySelector('[data-shaking="true"]'), { timeout: 1000 }).catch(() => {});
    
    await tiles[0].click();
    await tiles[1].click();
    
    await page.waitForFunction(() => !document.querySelector('[data-shaking="true"]'), { timeout: 1000 }).catch(() => {});
    
    await tiles[0].click();
    await tiles[1].click();
    
    // Wait for strikes indicator to show 3 strikes
    await expect(page.getByTestId('strikes-indicator').locator('[data-strike-active="true"]')).toHaveCount(3, { timeout: 3000 });
    
    // No streak popup should appear (user failed)
    await expect(page.getByTestId('streak-popup')).not.toBeVisible();
    
    // Verify null score was recorded
    const scoreRecorded = await verifyScoreValue(1, today, null);
    expect(scoreRecorded).toBe(true);
    
    // Verify streak was reset to 0
    const streak = await getUserStreak(1);
    expect(streak?.current_streak_length).toBe(0);
  });
});

test.describe('Streak Tracking - Unauthenticated User (Login After Completion)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestDatabase();
  });

  test('should show login prompt when unauthenticated user completes puzzle', async ({ page }) => {
    // Start without authentication
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    });
    
    await page.goto('/?dev=true&words=朋友&preventRestore=true');
    await completePuzzle(page, '朋友');
    
    // Login prompt should appear
    await expect(page.getByTestId('login-prompt-modal')).toBeVisible({ timeout: 5000 });
    
    // Streak popup should NOT appear
    await expect(page.getByTestId('streak-popup')).not.toBeVisible();
  });

  test('should submit pending score after user logs in', async ({ page }) => {
    const today = getTodayDateString();
    
    // Start without authentication
    let isAuthenticated = false;
    
    await page.route('**/api/auth/session', route => {
      if (isAuthenticated) {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              name: testUsers[2].name,
              email: testUsers[2].email,
              image: testUsers[2].image,
            },
            expires: '2099-12-31T23:59:59.999Z',
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
      }
    });
    
    // Complete puzzle while unauthenticated
    await page.goto('/?dev=true&words=学习&preventRestore=true');
    await completePuzzle(page, '学习');
    
    // Login prompt should appear
    await expect(page.getByTestId('login-prompt-modal')).toBeVisible({ timeout: 5000 });
    
    // Simulate login by changing authentication state and reloading
    isAuthenticated = true;
    await page.reload();
    
    // Wait for page to load - grid should be visible
    await expect(page.getByTestId('hanzi-grid')).toBeVisible({ timeout: 5000 });
    
    // After reload with auth, streak popup should appear
    await expect(page.getByTestId('streak-popup')).toBeVisible({ timeout: 5000 });
    
    // Streak should be 1 (new streak)
    const streakText = await page.getByTestId('streak-length').textContent();
    expect(streakText).toContain('1');
    
    await waitForScoreRecorded(1, today);
    
    // Verify score was submitted for User 3
    const scoreSubmitted = await verifyScoreSubmitted(3, today);
    expect(scoreSubmitted).toBe(true);
    
    // Verify streak was created
    const streakValid = await verifyStreak(3, 1, 1, today);
    expect(streakValid).toBe(true);
  });
});

test.describe('Streak Display', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestDatabase();
    await mockAuthSession(page, 1);
  });

  test('should display correct streak information in popup', async ({ page }) => {
    await page.goto('/?dev=true&words=开心&preventRestore=true');
    await completePuzzle(page, '开心');
    
    const streakPopup = page.getByTestId('streak-popup');
    await expect(streakPopup).toBeVisible({ timeout: 5000 });
    
    // Check streak length is displayed
    const streakLength = page.getByTestId('streak-length');
    await expect(streakLength).toBeVisible();
    await expect(streakLength).toContainText('4');
    
    // Check "Days" or "Day" text is present
    await expect(streakLength).toContainText('Days');
  });

  test('should show "Streak Started!" for new streak', async ({ page }) => {
    // User 3 has no streak yet
    await mockAuthSession(page, 3);
    
    await page.goto('/?dev=true&words=快乐&preventRestore=true');
    await completePuzzle(page, '快乐');
    
    const streakPopup = page.getByTestId('streak-popup');
    await expect(streakPopup).toBeVisible({ timeout: 5000 });
    
    // Should show "Streak Started!" for first day
    await expect(streakPopup).toContainText('Streak Started!');
  });

  test('should show "Streak Updated!" for continuing streak', async ({ page }) => {
    await page.goto('/?dev=true&words=努力&preventRestore=true');
    await completePuzzle(page, '努力');
    
    const streakPopup = page.getByTestId('streak-popup');
    await expect(streakPopup).toBeVisible({ timeout: 5000 });
    
    // Should show "Streak Updated!" when continuing
    await expect(streakPopup).toContainText('Streak Updated!');
  });
});
