/**
 * Shared test helper functions for Playwright tests
 */

import { Page, Locator } from '@playwright/test';

export interface SavedGameState {
  date: string;
  game: {
    tileStates: Array<{ match: number | null }>;
    strikes: number;
    completed: boolean;
  };
}

export async function collectTiles(page: Page): Promise<Locator> {
  return await page.getByTestId('hanzi-grid').getByTestId(/^hanzi-tile-/);
}

export async function clickTileByIndex(page: Page, index: number): Promise<Locator> {
  const tile = page.getByTestId(`hanzi-tile-${index}`);
  await tile.click({timeout: 1000});
  return tile;
}

export async function countSelectedTiles(page: Page): Promise<number> {
  const allTiles = await collectTiles(page);
  return allTiles.evaluateAll(tiles => 
    tiles.filter(tile => tile.getAttribute('data-selected') === 'true').length
  );
}

export async function closeHowToDialog(page: Page): Promise<void> {
  const { expect } = await import('@playwright/test');
  const startButton = page.getByTestId('how-to-start-button');
  await expect(startButton).toBeVisible();
  await startButton.click();
  await page.getByTestId('how-to-dialog').waitFor({ state: 'detached' });
}

export async function retrieveLocalSave(page: Page): Promise<SavedGameState | null> {
  return await page.evaluate(() => {
    return JSON.parse(localStorage.getItem('zimi-save'));
  });
}

export async function getTileIndexByCharacter(page: Page, character: string): Promise<number[]> {
  const tiles = await collectTiles(page);
  const indices: number[] = [];
  for (let i = 0; i < tiles.length; i++) {
    const tileChar = await tiles.nth(i).textContent();
    if (tileChar === character) indices.push(i);
  }
  return indices;
}
