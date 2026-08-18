import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

type CatalogEntry = {
  name: string;
  displayName: string;
  type: 'module' | 'plugin' | 'overlay';
  entry?: string;
  ui?: { cockpit?: string; overlay?: string[] };
  tags?: string[];
  sourceRepo: string;
  assetPattern: string;
  official?: boolean;
  recommended?: boolean;
};

type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
  digest?: string;
};

type GitHubRelease = {
  tag_name: string;
  html_url: string;
  assets: GitHubReleaseAsset[];
};

const outputPath = process.argv[2] ?? 'public/registry.json';
const catalog = JSON.parse(await readFile('registry.json', 'utf8')) as CatalogEntry[];

function versionFromTag(tag: string): string {
  return tag.replace(/^v/, '');
}

function githubApiUrl(sourceRepo: string): string {
  const url = new URL(sourceRepo);
  const [owner, repo] = url.pathname.replace(/^\//, '').split('/');
  if (url.hostname !== 'github.com' || !owner || !repo) {
    throw new Error(`unsupported add-on source repo: ${sourceRepo}`);
  }
  return `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
}

function assetName(pattern: string, version: string): string {
  return pattern.replaceAll('{version}', version);
}

function isSha256Digest(value: string | undefined): value is `sha256:${string}` {
  return Boolean(value?.match(/^sha256:[a-f0-9]{64}$/i));
}

async function getJson<T>(url: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return (await res.json()) as T;
}

const registry = await Promise.all(
  catalog.map(async (entry) => {
    const release = await getJson<GitHubRelease>(githubApiUrl(entry.sourceRepo));
    const version = versionFromTag(release.tag_name);
    const name = assetName(entry.assetPattern, version);
    const zip = release.assets.find((asset) => asset.name === name);

    if (!zip) throw new Error(`${entry.name} release is missing ${name}`);
    if (!isSha256Digest(zip.digest)) {
      throw new Error(`${entry.name} release asset is missing a sha256 digest`);
    }

    return {
      name: entry.name,
      displayName: entry.displayName,
      version,
      type: entry.type,
      ...(entry.entry ? { entry: entry.entry } : {}),
      ...(entry.ui ? { ui: entry.ui } : {}),
      sourceRepo: entry.sourceRepo,
      releasePage: release.html_url,
      zipUrl: zip.browser_download_url,
      checksum: zip.digest,
      official: entry.official,
      recommended: entry.recommended,
      tags: entry.tags ?? [],
    };
  }),
);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`wrote ${outputPath}: ${registry.length} add-ons`);
