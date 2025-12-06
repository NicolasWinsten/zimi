import GameView from "app/ui/game-view";
import ErrorPage from "app/ui/error-page";
import { getRandomWords, isValidWord } from "app/lib/dictionary"; 
import { currentDateSeed, dateSeedFromDate, sample, getDailyDifficulty } from "app/lib/utils";


export default async function Page(props) {
  const searchParams = await props.searchParams;
  
  // Use date from search params if provided, otherwise use current date
  let dateSeed = currentDateSeed()
  if (searchParams?.date) {
    try {
      const customDate = new Date(searchParams.date)
      // Check if date is valid
      if (!isNaN(customDate.getTime())) {
        dateSeed = dateSeedFromDate(customDate)
        console.log(`Using custom date: ${searchParams.date} -> ${dateSeed}`)
      } else {
        console.error('Invalid date parameter:', searchParams.date)
      }
    } catch (e) {
      console.error('Invalid date parameter:', searchParams.date, e)
    }
  }
  
  const hskLevel = getDailyDifficulty(dateSeed)
  
  // Use word list from search params if provided, otherwise get random words
  let todaysWords
  if (searchParams?.wordList) {
    // Parse comma-separated word list
    const customWords = searchParams.wordList
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0)
    // Validate that all words are valid
    const validWords = customWords.filter(word => isValidWord(word))
    if (validWords.length > 0) {
      todaysWords = validWords
      console.log(`Using custom word list: ${todaysWords.join(', ')}`)
    } else {
      // Show error page for invalid word list
      console.error('Invalid word list:', searchParams.wordList)
      return (
        <div>
          <ErrorPage invalidWordList={searchParams.wordList} />
        </div>
      )
    }
  } else {
    todaysWords = getRandomWords(8, dateSeed, hskLevel)
  }
  
  const chars = todaysWords.flatMap(word => Array.from(word))
  const shuffledChars = sample(chars.length, chars, dateSeed)
  
  console.log(`Today's words: ${todaysWords.join(', ')}`)
  console.log(`currentDateSeed: ${currentDateSeed()}`)
  console.log(`HSK Level: ${hskLevel}`)

  return (
      <div>
        <GameView words={todaysWords} shuffledChars={shuffledChars} dateSeed={dateSeed} hskLevel={hskLevel} />
      </div>
  );
}
