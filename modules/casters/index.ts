import type { ModuleContext } from '@zhago/types';

// Live commentary state — the cockpit form sets it, the overlay page renders
// it. Not a persistent roster; the cockpit only ever holds the *current* pair,
// same shape as the real app's commentary template fields.
interface CommentaryState {
  commentator1Name: string;
  commentator1Handle: string;
  commentator1Pronouns: string;
  commentator2Name: string;
  commentator2Handle: string;
  commentator2Pronouns: string;
}

const empty: CommentaryState = {
  commentator1Name: '',
  commentator1Handle: '',
  commentator1Pronouns: '',
  commentator2Name: '',
  commentator2Handle: '',
  commentator2Pronouns: '',
};

// Which overlay pack is live right now — its own namespace, not a field on
// CommentaryState, for the same reason match keeps it separate: `set`'s
// `{ ...empty, ...payload }` reset would snap the live overlay back to
// default on every unrelated commentator update otherwise.
interface OverlayState {
  skin: string;
}

const emptyOverlay: OverlayState = { skin: '' };

export default function init(ctx: ModuleContext) {
  let current: CommentaryState = empty;
  let overlay: OverlayState = emptyOverlay;

  ctx.on('casters', 'set', (payload: Partial<CommentaryState>) => {
    current = { ...empty, ...payload };
    ctx.emit('casters', 'update', current);
  });

  // Answered by the SSE route on connect, before it subscribes to live 'update's.
  ctx.on('casters', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, current);
  });

  // The overlay (modules/casters/overlay/index.js) watches this to know
  // which skin to load live — `skin: ''` means the shipped default.
  ctx.on('casters-overlay', 'set', (payload: Partial<OverlayState>) => {
    overlay = { ...emptyOverlay, ...payload };
    ctx.emit('casters-overlay', 'update', overlay);
  });

  ctx.on('casters-overlay', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, overlay);
  });

  ctx.log.info('ready');
}
