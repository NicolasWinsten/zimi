import seedrandom from "seedrandom"

/**
 * Converts a Date object to a consistent date seed string
 * @param {Date} date - the date to convert
 * @returns {string} a seed string based on the date (UTC)
 */
function mkDateStr(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * @returns {string} a seed based on the current date (UTC)
 */
function currentDateStr() {
  return mkDateStr(new Date())
}

/**
 * Calculate the daily HSK difficulty level (1-5) based on the date seed
 * @param {string} seed date seed string
 * @returns {number} HSK level between 1 and 5
 */
function getDailyDifficulty(seed) {
  const rng = seedrandom(seed)
  return Math.floor(rng() * 5) + 1
}

/**
 * no-duplicates sampling
 * @param {number} num number of random items to pull from array 
 * @param {Array} array source
 * @returns {Array} sampled items
 */
function sample(num, array, seed) {
  const indices = new Set()
  const rng = seedrandom(seed)
  while (indices.size < num) {
    let randomIndex = Math.floor(rng() * array.length)
    indices.add(randomIndex)
  }

  return Array.from(indices).map(i => array[i])
}

export { currentDateStr, mkDateStr, sample, getDailyDifficulty }