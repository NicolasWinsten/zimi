
export default function PlayerList({ players, dataFn }) {
  return (
    <div>
      { players.map((player, i) => (
        <div key={player.name + i}>
          <span>{player.name}: {dataFn(player)}</span>
        </div>
      ))}
    </div>
  )
}