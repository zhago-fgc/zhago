import type { ModuleContext } from '@zhago/types';
import data from './data.json';

// A game module — pure reference content, same shape as sf6/2xko.
export default function init(ctx: ModuleContext) {
  ctx.on('fatal-fury-cotw', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, data);
  });

  ctx.log.info('ready');
}
