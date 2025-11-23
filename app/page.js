import LikeButton from "./like-button";
import GameView from "./game-view";
import { getTodaysWords } from "./dictionary"; 
import { currentDateSeed, sample } from "./utils";
import DailyTimer from "./daily-timer";

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default function Page() {
  const todaysWords = getTodaysWords(8)
  const todaysChars = todaysWords.flatMap(word => Array.from(word))
  const shuffledChars = sample(todaysChars.length, todaysChars, currentDateSeed())
  console.log(`Today's words: ${todaysWords.join(', ')}`)
  console.log(`currentDateSeed: ${currentDateSeed()}`)

  return (
      <div>
        <Header title="ZiMi字谜!" />
        <DailyTimer />
        <GameView characters={shuffledChars}/>
        <LikeButton />
      </div>
  );
}
