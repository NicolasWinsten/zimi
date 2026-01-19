/**
 * Shared test helper functions for Playwright tests
 */

import { Page, Locator } from '@playwright/test';

export interface GameState {
  tileStates: Array<{ char: string; match: number | null; color: string | null; shaking: boolean;  }>;
  strikes: number;
}

export interface SavedGameState {
  date: string;
  game: GameState;
  words: string[];
  milliseconds: number;
}

export function howToDialog(page: Page): Locator {
  return page.getByTestId('how-to-dialog');
}

export function resumeGameDialog(page: Page): Locator {
  return page.getByTestId('resume-game-dialog');
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

/**
 * Close any open dialog modals on the page
 * Waits for all dialogs to be closed before returning
 * @param page 
 */
export async function closeAllDialogs(page: Page): Promise<void> {
  // Check if any dialogs exist (MUI Dialog uses role="dialog")
  const dialogs = page.locator('[role="dialog"]');
  const dialogCount = await dialogs.count();
  
  if (dialogCount === 0) {
    return; // No dialogs open
  }

  // Press ESC to close the topmost dialog
  await page.press('body', 'Escape');
  
  // Wait for dialogs to be detached and recursively close any remaining dialogs
  await page.waitForTimeout(300);
  
  // Recursively check if more dialogs exist
  const remainingDialogs = await page.locator('[role="dialog"]').count();
  if (remainingDialogs > 0) {
    await closeAllDialogs(page); // Recursively close remaining dialogs
  }
}

/**
 * Login a test user assuming on main page and no user is logged in
 * @param page 
 * @param email 
 * @param name 
 */
export async function loginTestUser(page: Page, email: string, name: string): Promise<void> {
  const returnTo = page.url();
  // Step 2: Click the user menu button
  await page.getByTestId('user-menu-button').click();

  // Step 3: Click the "Sign in" menu item
  await page.getByTestId('sign-in-menu-item').click();

  // Step 4: Fill in the test credentials form
  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /name/i }).fill(name);
  
  // Click the sign in button for the test credentials provider
  await page.getByRole('button', { name: /sign in with test login/i }).click();
  
  await page.waitForURL(returnTo, {timeout: 1000})
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