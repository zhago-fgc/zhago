import type { ModuleContext } from '@zhago/types';
import data from './data.json';

// A game module — pure reference content, same shape as the 2xko module.
// No portraits bundled — a TO supplies their own if they want icons.
// Roster/ranges live in data.json, not inline here, specifically so
// `bun --watch` picks up edits (see the comment in 2xko's index.ts for why).
export default function init(ctx: ModuleContext) {
  // Static content — nothing to broadcast, only answer when asked.
  ctx.on('sf6', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, data);
  });

  ctx.log.info('ready');
}
