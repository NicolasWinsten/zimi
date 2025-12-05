import { sample, currentDateSeed, getDailyDifficulty } from "../app/lib/utils";

test('sample nothing', () => {
  expect(sample(0, [1,2,3,4])).toEqual([]);
});

test('sample without duplicates', () => {
  const originalArray = [1,2,3,4,5,6,7,8,9,10];
  const result = sample(9, originalArray);
  result.forEach(x => expect(originalArray).toContain(x));
  expect(originalArray).toEqual([1,2,3,4,5,6,7,8,9,10])
  expect(result.length).toBe(9);
  expect(new Set(result).size).toBe(9);
})

test('sample all', () => {
  const originalArray = [1,2,3,4];
  const result1 = sample(4, originalArray).sort();
  const result2 = sample(4, originalArray).sort();
  expect(result1).toEqual(originalArray);
  expect(result2).toEqual(originalArray);
})

test('sample with same seed', () => {
  const seed = 'test-seed';
  const originalArray = Array.from({length: 100}, _ => Math.random());
  const result1 = sample(5, originalArray, seed);
  const result2 = sample(5, originalArray, seed);
  expect(result1).toEqual(result2);
})

test('currentDateSeed returns same string', () => {
  expect(currentDateSeed()).toEqual(currentDateSeed());
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
  const levels = new Set();
  for (let i = 0; i < 100; i++) {
    levels.add(getDailyDifficulty(`seed-${i}`));
  }
  // Should have multiple different levels across 100 seeds
  expect(levels.size).toBeGreaterThan(1);
})

