/**
 * Dictionary module
 * Provides functions to access and sample words from the HSK dictionary.
 */

import { currentDateSeed, sample } from './utils.js';
import Dictionary from 'public/HSK词典.json';


console.log("loading dictionary...");
const dictionary = Dictionary.filter(entry => entry.simplified.length == 2)
  // .filter(({level}) => level.includes('old-3'))

const dictionaryMap = new Map(dictionary.map(entry => [entry.simplified, entry]))

/**
 * Get HSK level strings for a given max level
 * @param {number} maxLevel max HSK level (1-5)
 * @returns {Set<string>} set of level strings
 */
function getLevelSet(maxLevel) {
  const levels = new Set()
  for (let i = 1; i <= maxLevel && i <= 5; i++) {
    levels.add(`old-${i}`)
    levels.add(`new-${i}`)
  }
  return levels
}

/**
 * Count how many additional valid words can be formed from a character pool
 * @param {Array<string>} words the selected words
 * @param {Set<string>} allowedLevels set of allowed HSK levels
 * @returns {number} count of extra valid words
 */
function countExtraWords(words, allowedLevels) {
  const chars = new Set(words.flatMap(word => Array.from(word)))
  const charArray = Array.from(chars)
  let extraCount = 0
  
  // Check all possible 2-character combinations
  // Note: O(n²) complexity is acceptable here as character pool is small (~8-16 chars)
  for (let i = 0; i < charArray.length; i++) {
    for (let j = i + 1; j < charArray.length; j++) {
      const word1 = charArray[i] + charArray[j]
      const word2 = charArray[j] + charArray[i]
      
      const entry1 = dictionaryMap.get(word1)
      const entry2 = dictionaryMap.get(word2)
      
      if (entry1 && entry1.level.some(lv => allowedLevels.has(lv)) && !words.includes(word1)) {
        extraCount++
      }
      if (entry2 && entry2.level.some(lv => allowedLevels.has(lv)) && !words.includes(word2)) {
        extraCount++
      }
    }
  }
  
  return extraCount
}

// Number of random samples to try when selecting words to maximize difficulty
const WORD_SELECTION_ATTEMPTS = 10

/**
 * Randomly selects today's words from the dictionary (based on current date)
 * Attempts to maximize the number of extra valid words that can be formed
 * @param {number} num number of words to get
 * @param {string} seed random seed
 * @param {number} level max HSK level (1-5)  
 * @returns {Array} array of selected words
 */
function getRandomWords(num, seed, level = 3) {
  const allowedLevels = getLevelSet(level)
  const isAllowed = word => word.level.some(lv => allowedLevels.has(lv))
  const candidates = dictionary.filter(isAllowed)
  
  // Try multiple samples and pick the one with most extra words
  let bestWords = null
  let maxExtraWords = -1
  
  for (let attempt = 0; attempt < WORD_SELECTION_ATTEMPTS; attempt++) {
    const attemptSeed = `${seed}-${attempt}`
    const words = sample(num, candidates, attemptSeed).map(word => word.simplified)
    const extraWords = countExtraWords(words, allowedLevels)
    
    if (extraWords > maxExtraWords) {
      maxExtraWords = extraWords
      bestWords = words
    }
  }
  
  return bestWords
}

function isValidWord(word) {
  return dictionaryMap.has(word)
}

function getDictionaryEntry(word) {
  return dictionaryMap.get(word);
}

export { getRandomWords, isValidWord, getDictionaryEntry }