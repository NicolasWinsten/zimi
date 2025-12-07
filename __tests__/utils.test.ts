import { sample, currentDateStr, mkDateStr, getDailyDifficulty } from "../app/lib/utils";

test('sample nothing', () => {
  expect(sample(0, [1,2,3,4])).toEqual([]);
});

test('sample without duplicates', () => {
  const originalArray: number[] = [1,2,3,4,5,6,7,8,9,10];
  const result = sample(9, originalArray);
  result.forEach(x => expect(originalArray).toContain(x));
  expect(originalArray).toEqual([1,2,3,4,5,6,7,8,9,10])
  expect(result.length).toBe(9);
  expect(new Set<number>(result).size).toBe(9);
})

test('sample all', () => {
  const originalArray: number[] = [1,2,3,4];
  const result1 = sample(4, originalArray).sort();
  const result2 = sample(4, originalArray).sort();
  expect(result1).toEqual(originalArray);
  expect(result2).toEqual(originalArray);
})

test('sample with same seed', () => {
  const seed = 'test-seed';
  const originalArray: number[] = Array.from({length: 100}, _ => Math.random());
  const result1 = sample(5, originalArray, seed);
  const result2 = sample(5, originalArray, seed);
  expect(result1).toEqual(result2);
})

test('currentDateStr returns same string', () => {
  expect(currentDateStr()).toEqual(currentDateStr());
})

test('getDailyDifficulty returns level between 1 and 5', () => {
  const seed = 'test-seed';
  const level = getDailyDifficulty(seed);
  expect(level).toBeGreaterThanOrEqual(1);
  expect(level).toBeLessThanOrEqual(5);
  expect(Number.isInteger(level)).toBe(true);
})

test('getDailyDifficulty returns same level for same seed', () => {
  const seed = 'test-seed';
  const level1 = getDailyDifficulty(seed);
  const level2 = getDailyDifficulty(seed);
  expect(level1).toEqual(level2);
})

test('getDailyDifficulty returns different levels for different seeds', () => {
  const levels = new Set<number>();
  for (let i = 0; i < 100; i++) {
    levels.add(getDailyDifficulty(`seed-${i}`));
  }
  // Should have 5 discrete values (1 to 5)
  // this has a very very small chance of failing due to randomness
  expect(levels.size).toEqual(5);
})

test('mkDateStr returns consistent seed for same date', () => {
  const date1 = new Date('2025-01-01T10:30:00Z');
  const date2 = new Date('2025-01-01T22:45:00Z');
  const seed1 = mkDateStr(date1);
  const seed2 = mkDateStr(date2);
  // Should return same seed regardless of time
  expect(seed1).toEqual(seed2);
})

test('mkDateStr returns different seeds for different dates', () => {
  const date1 = new Date('2025-01-01');
  const date2 = new Date('2025-01-02');
  const seed1 = mkDateStr(date1);
  const seed2 = mkDateStr(date2);
  expect(seed1).not.toEqual(seed2);
})

test('mkDateStr matches currentDateStr for today', () => {
  const now = new Date();
  const seed1 = mkDateStr(now);
  const seed2 = currentDateStr();
  expect(seed1).toEqual(seed2);
})
