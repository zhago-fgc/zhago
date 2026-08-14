import type { ModuleContext } from '@zhago/types'

// Live match state — same pattern as the casters module: the cockpit form
// sets it, the overlay renders it, nothing persists (it's "what's happening
// right now," not reference data — that's Directory-shaped modules' job).
//
// `game` names an installed game module (e.g. "2xko"), which Match never
// imports or calls directly — the cockpit queries that module's own bus
// stream for its roster and declared ranges. A side is a `players[]` +
// `characters[]` pair rather than fixed `player1Name`/`player2Name` fields,
// because the count of each varies per game and per side independently:
// 2XKO allows 1 or 2 players a side, Skullgirls allows 1-3 characters a
// side, DBFZ fixes exactly 3. `team` is the free-text org/roster name (e.g.
// "FlyQuest") — unrelated to any of that, same as any team-based bracket,
// independent of which game is being played. Fixed at two sides — no
// current game needs more than that; revisit if one does. Match works
// exactly the same with `game` left empty (no players/characters, team
// stays free text either way).
interface Side {
  id: string
  team: string
  score: number
  players: string[]
  characters: string[]
}

interface MatchState {
  game: string
  round: string
  bestOf: number
  sides: [Side, Side]
}

function emptySide(id: string): Side {
  return { id, team: '', score: 0, players: [], characters: [] }
}

const empty: MatchState = {
  game: '',
  round: '',
  bestOf: 3,
  sides: [emptySide('side-1'), emptySide('side-2')],
}

export default function init(ctx: ModuleContext) {
  let current: MatchState = empty

  ctx.on('match', 'set', (payload: Partial<MatchState>) => {
    current = { ...empty, ...payload }
    ctx.emit('match', 'update', current)
  })

  // Answered by the SSE route on connect, before it subscribes to live 'update's.
  ctx.on('match', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, current)
  })

  ctx.log.info('ready')
}
