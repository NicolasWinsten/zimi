import { test, expect } from '@playwright/test';
import { clickTileByIndex, closeHowToDialog, getTileByCharacter, retrieveLocalSave } from './helpers';

test.describe('LocalStorage Game State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');

    // Ensure localStorage is cleared before each test (sanity check)
    expect(await retrieveLocalSave(page)).toBeNull();
  });

  test('should save unfinished game state correctly', async ({ page }) => {
    await page.goto('/?words=钱包,别人,男生,马上,请假,有时,前天,后边&dev=true');
    await closeHowToDialog(page);
    
    // Click a few tiles to create some game state
    // match 钱包
    await getTileByCharacter(page, '钱').click();
    await getTileByCharacter(page, '包').click();

    // mismatch 马前
    await getTileByCharacter(page, '马').click();
    await getTileByCharacter(page, '前').click();
    
    await page.reload();

    // Check that localStorage has saved game data
    const savedData = await retrieveLocalSave(page);
    
    expect(savedData).not.toBeNull();

    const savedDate = new Date(savedData!.date);
    const today = new Date();
    
    // Check that the saved date is today (ignoring time)
    expect(savedDate.getUTCFullYear()).toEqual(today.getUTCFullYear());
    expect(savedDate.getUTCMonth()).toEqual(today.getUTCMonth());
    expect(savedDate.getUTCDate()).toEqual(today.getUTCDate());

    const { tileStates, strikes } = savedData!.game;

    // expect one strike and one matched pair
    expect(strikes).toEqual(1);
    expect(tileStates.every(t => !"钱包".includes(t.char) || t.match !== null)).toBe(true);

    // get rid of resume game dialog
    const resumeButton = page.getByTestId('resume-game-button');
    await resumeButton.click();
    // unmatch 钱包
    await getTileByCharacter(page, '钱').click();

    await page.reload();

    const savedDataAfterUnmatch = await retrieveLocalSave(page);
    expect(savedDataAfterUnmatch).not.toBeNull();

    const { tileStates: tileStatesAfterUnmatch, strikes: strikesAfterUnmatch } = savedDataAfterUnmatch!.game;

    // expect still one strike and zero matched pairs
    expect(strikesAfterUnmatch).toEqual(1);
    expect(tileStatesAfterUnmatch.every(t => t.match === null)).toBe(true);
  });

  test('should show resume dialog when saved game exists', async ({ page }) => {
    // First visit: create a saved game
    await page.goto('');
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
    await page.goto('');
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
    
    // // Resume the game
    const resumeButton = page.getByTestId('resume-game-button');
    await resumeButton.click();
    
    // Verify tiles still have the same content (same seed)
    await expect(page.getByTestId('hanzi-tile-0')).toHaveText(tile0Text!);
    await expect(page.getByTestId('hanzi-tile-4')).toHaveText(tile4Text!);
    
  });

  test('should not show resume dialog for different date', async ({ page }) => {
    // Visit with one date and create saved game
    await page.goto('/?dev=true&date=2025-01-01');
    await closeHowToDialog(page);
    
    await clickTileByIndex(page, 0);
    await clickTileByIndex(page, 4);
    await page.waitForTimeout(500);
    
    // Visit with different date
    await page.goto('/?dev=true&date=2025-01-02');
    
    // Should show how-to dialog, not resume dialog
    const howToDialog = page.getByTestId('how-to-start-button');
    await expect(howToDialog).toBeVisible();
    
    const resumeDialog = page.getByTestId('resume-game-button');
    await expect(resumeDialog).not.toBeVisible();
  });

});
