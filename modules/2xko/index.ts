import type { ModuleContext } from '@zhago/types';
import data from './data.json';

// A game module — pure reference content, no writes, no logic. Match reads
// this to know what characters 2XKO has; nothing else in the system needs to
// know 2XKO exists. Portraits deliberately left out — no game art bundled,
// a TO supplies their own if they want icons.
//
// Roster/ranges live in data.json, not inline here, specifically so
// `bun --watch` picks up edits (a static `import` is a watched dependency;
// data embedded in module.json is read dynamically at runtime and would
// need a manual restart).
export default function init(ctx: ModuleContext) {
  // Static content — nothing to broadcast, only answer when asked.
  ctx.on('2xko', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, data);
  });

  ctx.log.info('ready');
}
