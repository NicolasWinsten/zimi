import { test, expect } from '@playwright/test';
import { collectTiles, clickTileByIndex, getSelectedTile, getTileByCharacter } from './helpers';

test.describe('Two tile custom game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the custom game page with 2 tiles
    await page.goto('http://localhost:3000/?dev=true&words=结婚');
    
    // Close the "How To" dialog if it appears
    const startButton = page.getByTestId('how-to-start-button');

    await expect(startButton).toBeVisible();

    await startButton.click()
    
    await page.getByTestId('how-to-dialog').waitFor({ state: 'detached' });

    const howToDialog = page.getByTestId('how-to-dialog');
    await expect(howToDialog).toHaveCount(0);

    const resumeDialog = page.getByTestId('resume-game-dialog');
    await expect(resumeDialog).toHaveCount(0);

    // Wait for the grid to load
    await page.getByTestId('hanzi-grid').waitFor();
  })

  test('match two tiles', async ({ page }) => {
    const jie = getTileByCharacter(page, '结');
    const hun = getTileByCharacter(page, '婚');

    await jie.click();
    await hun.click();

    const color = await jie.getAttribute('data-match-color');
    expect(color).toBeTruthy();

    await expect(hun).toHaveAttribute('data-match-color', color!);
  });
});

test.describe('HanziGrid Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game page
    await page.goto('http://localhost:3000');
    
    // Close the "How To" dialog if it appears
    const startButton = page.getByTestId('how-to-start-button');

    await expect(startButton).toBeVisible();

    await startButton.click()
    
    await page.getByTestId('how-to-dialog').waitFor({ state: 'detached' });

    const howToDialog = page.getByTestId('how-to-dialog');
    await expect(howToDialog).toHaveCount(0);

    const resumeDialog = page.getByTestId('resume-game-dialog');
    await expect(resumeDialog).toHaveCount(0);

    // Wait for the grid to load
    await page.getByTestId('hanzi-grid').waitFor();
  });

  test('grid exists on page', async ({ page }) => {
    const grid = page.getByTestId('hanzi-grid');
    await expect(grid).toBeVisible();
  });

  test('should render 16 tiles in a 4x4 grid', async ({ page }) => {
    const tiles = await collectTiles(page);
    await expect(tiles).toHaveCount(16);
  });

  test('should select a tile when clicked', async ({ page }) => {
    const tile0 = page.getByTestId('hanzi-tile-0');
    
    // Click the tile
    await clickTileByIndex(page, 0);
    
    // Verify tile is selected
    await expect(tile0).toHaveAttribute('data-selected', 'true');
    
    // verify only one tile is selected
    await expect(getSelectedTile(page)).toHaveCount(1); 
  });

  test('should deselect a tile when clicked twice', async ({ page }) => {
    const tile0 = page.getByTestId('hanzi-tile-0');
    const tile1 = page.getByTestId('hanzi-tile-1');
    
    // Select first tile
    await clickTileByIndex(page, 0);
    await expect(tile0).toHaveAttribute('data-selected', 'true');

    await expect(getSelectedTile(page)).toHaveCount(1); 
  
    // Deselect by clicking again
    await clickTileByIndex(page, 0);
    await expect(tile0).toHaveAttribute('data-selected', 'false');
    
    // Verify no tiles are selected
    await expect(getSelectedTile(page)).toHaveCount(0);
    
    // Select a different tile
    await clickTileByIndex(page, 1);
    await expect(tile1).toHaveAttribute('data-selected', 'true');
    
    await expect(getSelectedTile(page)).toHaveCount(1);

    // Deselect by clicking again
    await clickTileByIndex(page, 1);
    await expect(tile1).toHaveAttribute('data-selected', 'false');
    
    // Verify no tiles are selected
    await expect(getSelectedTile(page)).toHaveCount(0);
  });

  test('should show strikes counter', async ({ page }) => {
    // Find the strikes indicator
    const strikesContainer = page.getByTestId('strikes-indicator');
    await expect(strikesContainer).toBeVisible();
    
    // Should show 3 strike marks
    const strike1 = strikesContainer.getByTestId('strike-1');
    const strike2 = strikesContainer.getByTestId('strike-2');
    const strike3 = strikesContainer.getByTestId('strike-3');
    await expect(strike1).toBeVisible();
    await expect(strike2).toBeVisible();
    await expect(strike3).toBeVisible();
  });

  test('should show timer display', async ({ page }) => {
    // Look for timer
    const timer = await page.getByTestId('timer-display');
    await expect(timer).toBeVisible();
  });

});
