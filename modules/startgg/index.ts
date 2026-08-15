import type { ModuleContext } from '@zhago/types';

// The token never appears in `current` (broadcast over SSE with
// Access-Control-Allow-Origin: '*' — see server.ts) — only a `connected`
// boolean does. It's read once from storage at init and kept in a closure
// variable, same pattern match/casters use for their own live state.
interface StartggEvent {
  id: number;
  name: string;
  numEntrants: number;
}

interface StartggTournament {
  id: number;
  name: string;
  city: string | null;
  events: StartggEvent[];
}

interface StartggState {
  connected: boolean;
  slug: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
  tournament: StartggTournament | null;
  error: string | null;
}

const TOURNAMENT_QUERY = `
  query TournamentQuery($slug: String) {
    tournament(slug: $slug) {
      id
      name
      city
      events {
        id
        name
        numEntrants
      }
    }
  }
`;

// Plain fetch instead of a GraphQL client library — GraphQL over HTTP is
// just a JSON POST, and a library here would need to survive `bun --compile`
// bundling every installed module ships through eventually. No point taking
// that risk for what's a five-line request.
async function queryStartgg<T>(token: string, query: string, variables: Record<string, unknown>) {
  const res = await fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors[0].message);
  if (!res.ok) throw new Error(`start.gg API error: ${res.status}`);
  return body.data as T;
}

export default function init(ctx: ModuleContext) {
  let token: string | null = ctx.storage.get('config', 'token')?.token ?? null;

  let current: StartggState = {
    connected: !!token,
    slug: '',
    status: 'idle',
    tournament: null,
    error: null,
  };

  const publish = () => ctx.emit('startgg', 'update', current);

  ctx.on('startgg', 'set-token', ({ token: newToken }: { token: string }) => {
    token = newToken;
    ctx.storage.insert('config', { token }, 'token');
    current = { ...current, connected: true };
    publish();
  });

  ctx.on('startgg', 'clear-token', () => {
    token = null;
    ctx.storage.remove('config', 'token');
    current = { ...current, connected: false };
    publish();
  });

  // Fetches by slug rather than caching a roster — same "answer what's asked,
  // hold only the current snapshot" shape as match/casters, just triggered by
  // a slug instead of a form submit.
  ctx.on('startgg', 'set-slug', async ({ slug }: { slug: string }) => {
    if (!token) {
      current = { ...current, slug, status: 'error', tournament: null, error: 'No API token saved.' };
      publish();
      return;
    }

    current = { ...current, slug, status: 'loading', tournament: null, error: null };
    publish();

    try {
      const data = await queryStartgg<{ tournament: StartggTournament | null }>(
        token,
        TOURNAMENT_QUERY,
        { slug },
      );
      if (!data.tournament) throw new Error('Tournament not found.');
      current = { ...current, status: 'ready', tournament: data.tournament, error: null };
    } catch (err) {
      current = {
        ...current,
        status: 'error',
        tournament: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
    publish();
  });

  // Answered by the SSE route on connect, before it subscribes to live 'update's.
  ctx.on('startgg', 'get-current', ({ replyTopic }: { replyTopic: string }) => {
    ctx.emit('reply', replyTopic, current);
  });

  ctx.log.info('ready');
}
