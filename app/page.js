import GameView from "app/ui/game-view";
import { getTodaysWords } from "app/lib/dictionary"; 
import { currentDateSeed } from "app/lib/utils";


export default async function Page() {

  const todaysWords = getTodaysWords(8)
  console.log(`Today's words: ${todaysWords.join(', ')}`)
  console.log(`currentDateSeed: ${currentDateSeed()}`)

  return (
      <div>
        <GameView words={todaysWords} />
      </div>
  );
}
