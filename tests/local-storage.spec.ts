import { test, expect } from '@playwright/test';
import { clickTileByIndex, closeHowToDialog, retrieveLocalSave } from './helpers';

test.describe('LocalStorage Game State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Ensure localStorage is cleared before each test (sanity check)
    expect(await retrieveLocalSave(page)).toBeNull();
  });

  test('should save game state to localStorage when playing', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await closeHowToDialog(page);
    
    // Click a few tiles to create some game state
    await clickTileByIndex(page, 0);
    await clickTileByIndex(page, 4);
    
    await page.waitForTimeout(1000); // Let it save

    // Check that localStorage has saved game data
    const savedData = await retrieveLocalSave(page);
    
    expect(savedData).not.toBeNull();

    const savedDate = new Date(savedData!.date);
    const today = new Date();
    
    // Check that the saved date is today (ignoring time)
    expect(savedDate.getFullYear()).toEqual(today.getFullYear());
    expect(savedDate.getMonth()).toEqual(today.getMonth());
    expect(savedDate.getDate()).toEqual(today.getDate());

    const { tileStates, strikes, completed } = savedData!.game;

    expect(completed).toBeFalsy();
    expect([0,1].includes(strikes)).toBeTruthy();
    
    const numMatches = tileStates.filter(t => t.match !== null).length;

    // should have at least one strike or one matched pair
    expect(strikes == 1 ? numMatches == 0 : numMatches == 1).toBeTruthy();
  });

  test('should show resume dialog when saved game exists', async ({ page }) => {
    // First visit: create a saved game
    await page.goto('http://localhost:3000');
    await closeHowToDialog(page);
    
    // Make some progress
    await clickTileByIndex(page, 0);
    await clickTileByIndex(page, 4);
    await page.waitForTimeout(500); // Let it save
    
    // Reload the page
    await page.reload();
    
    // Should see resume dialog instead of how-to dialog
    const resumeBtn = page.getByTestId('resume-game-button');
    await expect(resumeBtn).toBeVisible();
    
    
  });

  test('should restore game state when resuming', async ({ page }) => {
    // First visit: create a saved game with specific state
    await page.goto('http://localhost:3000/');
    await closeHowToDialog(page);
    
    // try matching two tiles
    await clickTileByIndex(page, 0);
    await clickTileByIndex(page, 4);
    
    // Get the selected tiles' characters for verification
    const tile0Text = await page.getByTestId('hanzi-tile-0').textContent();
    const tile4Text = await page.getByTestId('hanzi-tile-4').textContent();
    
    await page.waitForTimeout(500); // Let it save
    
    // Reload the page
    await page.reload();
    
    // Resume the game
    const resumeDialog = page.getByTestId('resume-game-dialog');
    await expect(resumeDialog).toBeVisible();
    
    const resumeButton = page.getByTestId('resume-game-button');
    await resumeButton.click();
    
    await resumeDialog.waitFor({ state: 'hidden' });
    
    // Verify tiles still have the same content (same seed)
    await expect(page.getByTestId('hanzi-tile-0')).toHaveText(tile0Text!);
    await expect(page.getByTestId('hanzi-tile-4')).toHaveText(tile4Text!);
    
  });

  test('should not show resume dialog for different date', async ({ page }) => {
    // Visit with one date and create saved game
    await page.goto('http://localhost:3000?dev=true&date=2025-01-01');
    await closeHowToDialog(page);
    
    await clickTileByIndex(page, 0);
    await page.waitForTimeout(500);
    
    // Visit with different date
    await page.goto('http://localhost:3000?dev=true&date=2025-01-02');
    
    // Should show how-to dialog, not resume dialog
    const howToDialog = page.getByTestId('how-to-dialog');
    await expect(howToDialog).toBeVisible();
    
    const resumeDialog = page.getByTestId('resume-game-dialog');
    await expect(resumeDialog).not.toBeVisible();
  });

});
