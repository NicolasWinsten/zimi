declare module 'app/lib/utils' {
  export function currentDateStr(): string;
  export function sample<T>(num: number, array: T[], seed?: string): T[];
  export function mkDateStr(date: Date): string;
  export function getDailyDifficulty(seed: string): number;
}

declare module 'app/lib/dictionary' {
  export function getRandomWords(num: number, seed?: string, level?: number): string[];
  export function isValidWord(word: string): boolean;
  export interface DictionaryEntry {
    simplified: string;
    level: string[];
    forms?: Array<{
      transcriptions?: { pinyin?: string };
      meanings?: string[];
    }>;
  }
  export function getDictionaryEntry(word: string): DictionaryEntry | undefined;
}

declare module 'app/ui/*' {
  import { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module 'app/lib/db/db' {
  export function getTopScores(limit?: number): Promise<Array<{name: string, milliseconds: number}>>;
  export function submitDailyScore(milliseconds: number | null): Promise<any>;
  export function getStreak(): Promise<{current_streak_length: number, longest_streak_length: number, current_streak_last_date: string} | null>;
  export function updateStreak(completed: boolean): Promise<{current_streak_length: number, longest_streak_length: number}>;
}
