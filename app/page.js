import GameSession from "app/ui/game-session";
import ErrorPage from "app/ui/error-page";
import { getRandomWords, isValidWord } from "app/lib/dictionary"; 
import { currentDateStr, mkDateStr, sample, getDailyDifficulty } from "app/lib/utils";


export default async function Page(props) {
  const searchParams = await props.searchParams;
  
  const devMode = searchParams?.dev === 'true'
  
  // Use date from search params if provided, otherwise use current date
  let dateSeed = currentDateStr()
  if (devMode && searchParams?.date) {
    const customDate = new Date(searchParams.date)
    // Check if date is valid
    if (isNaN(customDate.getTime())) {
      return <ErrorPage msg="Invalid date format" info={searchParams.date} />
    } else {
      dateSeed = mkDateStr(customDate)
      console.log(`Using custom date: ${dateSeed}`)
    }
  }
  
  const hskLevel = getDailyDifficulty(dateSeed)
  
  // Use word list from search params if provided, otherwise get random words
  let todaysWords
  let customWordList = false
  if (devMode && searchParams?.words) {
    // Parse comma-separated word list
    const customWords = searchParams.words
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0)
    // Validate that all words are valid
    const validWords = customWords.every(word => isValidWord(word) && word.length === 2)
    if (validWords) {
      todaysWords = customWords
      customWordList = true
      console.log(`Using custom word list: ${todaysWords.join(', ')}`)
    } else {
      // Show error page for invalid word list
      console.error('Invalid word list:', searchParams.words)
      return <ErrorPage msg="Invalid word list" info={searchParams.words} />
    }
  } else {
    todaysWords = getRandomWords(8, dateSeed, hskLevel)
  }
  
  const chars = todaysWords.flatMap(word => Array.from(word))
  const shuffledChars = sample(chars.length, chars, dateSeed)
  
  console.log(`Today's words: ${todaysWords.join(', ')}`)
  console.log(`HSK Level: ${hskLevel}`)

  return (
      <div>
        <GameSession key={dateSeed} words={todaysWords} shuffledChars={shuffledChars} dateSeed={dateSeed} hskLevel={hskLevel} />
      </div>
  );
}
