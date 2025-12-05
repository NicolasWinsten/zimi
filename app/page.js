import GameView from "app/ui/game-view";
import { getRandomWords } from "app/lib/dictionary"; 
import { currentDateSeed, sample, getDailyDifficulty } from "app/lib/utils";


export default async function Page() {
  
  const dateSeed = currentDateSeed()
  const hskLevel = getDailyDifficulty(dateSeed)
  const todaysWords = getRandomWords(8, dateSeed, hskLevel)
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
