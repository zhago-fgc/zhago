import type { ModuleContext } from '@zhago/types';
import data from './data.json';

// A game module — pure reference content, same shape as sf6/2xko.
// Unlike SF6's fixed 1-character 1v1, KOF's series-wide format is a
// 3-character team battle, one player per side — hence charactersPerSide
// fixed at 3 while playersPerSide stays fixed at 1, same shape a DBFZ
// module would declare. Roster is the Ultimate Edition set (39 base across
// 13 teams + 20 DLC), verified against multiple sources (Aug 2026).
export default function init(ctx: ModuleContext) {
  ctx.on('kofxv', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, data);
  });

  ctx.log.info('ready');
}
