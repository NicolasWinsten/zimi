import seedrandom from "seedrandom"

/**
 * @returns {string} a seed based on the current date (UTC)
 */
function currentDateSeed() {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  return now.toUTCString()
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

export { currentDateSeed, sample }