import GameView from "app/game-view";
import { getTodaysWords } from "app/dictionary"; 
import { currentDateSeed } from "app/utils";
import DailyTimer from "app/daily-timer";
import SignInButton from "app/signin-button";

function Header({ title }) {
  return <h1>{title ? title : 'Default title'}</h1>;
}

export default async function Page() {

  const todaysWords = getTodaysWords(8)
  console.log(`Today's words: ${todaysWords.join(', ')}`)
  console.log(`currentDateSeed: ${currentDateSeed()}`)

  return (
      <div>
        <Header title="ZiMi字谜!" />
        <DailyTimer />
        <GameView words={todaysWords} />
        <SignInButton />
      </div>
  );
}
