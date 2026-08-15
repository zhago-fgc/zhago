import type { ModuleContext } from '@zhago/types';

// Standalone caster roster — no dependency on players/events/tournaments,
// so a TO who only wants casters + a live commentary overlay never has to
// install anything else. Distinct from the casters module's live on-air
// state; this is reference data, that's "who's on right now."
export default function init(ctx: ModuleContext) {
  const list = () => ctx.storage.query('casters');
  const broadcast = () => ctx.emit('caster-directory', 'update', list());

  ctx.on('caster-directory', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, list());
  });

  ctx.on(
    'caster-directory',
    'create',
    (payload: { name: string; handle?: string; pronouns?: string }) => {
      if (!payload.name) return ctx.log.warn('caster create missing name');
      ctx.storage.insert('casters', {
        name: payload.name,
        handle: payload.handle ?? null,
        pronouns: payload.pronouns ?? null,
      });
      broadcast();
    },
  );

  ctx.on(
    'caster-directory',
    'edit',
    (payload: { id: string; name: string; handle?: string; pronouns?: string }) => {
      if (!payload.id || !payload.name) return ctx.log.warn('caster edit missing id/name');
      // insert() upserts by id (INSERT OR REPLACE) — passing the existing id
      // replaces that row in place instead of creating a new one.
      ctx.storage.insert(
        'casters',
        { name: payload.name, handle: payload.handle ?? null, pronouns: payload.pronouns ?? null },
        payload.id,
      );
      broadcast();
    },
  );

  ctx.on('caster-directory', 'delete', ({ id }: { id: string }) => {
    ctx.storage.remove('casters', id);
    broadcast();
  });

  ctx.log.info('ready');
}
