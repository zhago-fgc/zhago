import type { ModuleContext } from '@zhago/types'

// Live match state — same pattern as the casters module: the cockpit form
// sets it, the overlay renders it, nothing persists (it's "what's happening
// right now," not reference data — that's Directory-shaped modules' job).
interface MatchState {
  player1Name: string
  player1Team: string
  player1Score: number
  player2Name: string
  player2Team: string
  player2Score: number
  round: string
  bestOf: number
}

const empty: MatchState = {
  player1Name: '',
  player1Team: '',
  player1Score: 0,
  player2Name: '',
  player2Team: '',
  player2Score: 0,
  round: '',
  bestOf: 3,
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
