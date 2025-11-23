/**
 * Dictionary module
 * Provides functions to access and sample words from the HSK dictionary.
 */

import { currentDateSeed, sample } from './utils.js';
import Dictionary from './api/data/HSK词典.json';


console.log("loading dictionary...");
const dictionary = Dictionary.filter(entry => entry.simplified.length == 2)
  .filter(({level}) => level.includes('old-3'))

const dictionarySet = new Set(dictionary.map(entry => entry.simplified))

/**
 * Randomly selects today's words from the dictionary (based on current date)
 * @param {number} num number of words to get
 * @param {number} level max HSK level (1-7)  
 * @returns {Array} array of selected words
 */
function getTodaysWords(num, level) {
  let levels = ['old-1', 'new-1', 'old-2', 'new-2', 'old-3', 'new-3']
  let words = sample(num, dictionary, currentDateSeed())
  return words.map(word => word.simplified)
}

function isValidWord(word) {
  return dictionarySet.has(word)
}

export { getTodaysWords, isValidWord }
