import GameView from "app/ui/game-view";
import { getTodaysWords } from "app/lib/dictionary"; 
import { currentDateSeed } from "app/lib/utils";
import { NotoSerifChinese } from "app/ui/fonts";
import SignInButton from "app/ui/usersession-button";

function ZimiBanner() {
return (
  <header>
    <div className="flex items-center justify-center py-4">
      <div className={`${NotoSerifChinese.className} flex items-center gap-3`}>
        <h1 className="text-3xl font-bold text-gray-800 underline">ZiMi 字谜</h1>
        <SignInButton />
      </div>
    </div>
  </header>
)

}

export default async function Page() {

  const todaysWords = getTodaysWords(8)
  console.log(`Today's words: ${todaysWords.join(', ')}`)
  console.log(`currentDateSeed: ${currentDateSeed()}`)

  return (
      <div>
        <ZimiBanner />
        <GameView words={todaysWords} />
      </div>
  );
}
