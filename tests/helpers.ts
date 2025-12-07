/**
 * Shared test helper functions for Playwright tests
 */

import { Page, Locator } from '@playwright/test';

export interface GameState {
  tileStates: Array<{ char: string; match: number | null; color: string | null; shaking: boolean;  }>;
  selectedTile: number | null;
  completed: boolean;
  strikes: number;
}

export interface SavedGameState {
  date: string;
  game: GameState;
  words: string[];
  milliseconds: number;
}

export function getGridElement(page: Page): Locator {
  return page.getByTestId('hanzi-grid');
}

export function collectTiles(page: Page): Locator {
  return page.getByTestId('hanzi-grid').getByTestId(/^hanzi-tile-/);
}

export function getTileByIndex(page: Page, index: number): Locator {
  return page.getByTestId(`hanzi-tile-${index}`);
}

export function getTileByCharacter(page: Page, character: string): Locator {
  return page.getByTestId('hanzi-grid').getByText(character);
}

export async function clickTileByIndex(page: Page, index: number): Promise<void> {
  const tile = page.getByTestId(`hanzi-tile-${index}`);
  await tile.click({timeout: 1000});
}

export function getSelectedTile(page: Page): Locator {
  return getGridElement(page).locator('[data-testid^="hanzi-tile-"][data-selected="true"]')
}

export async function closeHowToDialog(page: Page): Promise<void> {
  const startButton = page.getByTestId('how-to-start-button');
  await startButton.click();
  await page.getByTestId('how-to-dialog').waitFor({ state: 'detached' });
}

export async function retrieveLocalSave(page: Page): Promise<SavedGameState | null> {
  return await page.evaluate(() => {
    const item = localStorage.getItem('zimi-save');
    return item ? JSON.parse(item) : null;
  });
}

export function activeStrikes(page: Page): Promise<number> {
  return page.getByTestId('strikes-indicator').filter({ has: page.locator('[data-strike-active="true"]') }).count();
}

export async function collectTileStates(page: Page): Promise<Array<{ char: string; match: number | null; color: string | null; shaking: boolean;  }>> {
  const tiles = collectTiles(page);
  const tileStates = await tiles.evaluateAll((tileElements) => {
    return tileElements.map(tile => ({
      char: tile.textContent || '',
      match: null,
      color: tile.getAttribute('data-match-color'),
      shaking: false,
    }));
  })

  return tileStates.map((state, index) => {
    if (state.color) {
      const match = tileStates.findIndex((t, i) => i !== index && t.color === state.color);
      return {...state, match: match == -1 ? null : match};
    } else {
      return state
    }
  });

}