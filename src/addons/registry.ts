import { readFile } from 'node:fs/promises';
import { config } from '../config';
import type { ModuleManifest } from '../types';

export interface AddOnCatalogEntry extends Omit<ModuleManifest, 'version'> {
  sourceRepo: string;
  assetPattern: string;
  official?: boolean;
  recommended?: boolean;
}

export interface AddOnRegistryEntry extends ModuleManifest {
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksum: `sha256:${string}`;
  official?: boolean;
  recommended?: boolean;
}

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  digest?: string;
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  assets: GitHubReleaseAsset[];
}

const DEFAULT_REGISTRY_URL = 'https://zhago-fgc.github.io/zhago/registry.json';
const LOCAL_REGISTRY_PATH = 'registry.json';

function versionFromTag(tag: string): string {
  return tag.replace(/^v/, '');
}

function patternForVersion(pattern: string, version: string): string {
  return pattern.replaceAll('{version}', version);
}

function isSha256Digest(value: string | undefined): value is `sha256:${string}` {
  return Boolean(value?.match(/^sha256:[a-f0-9]{64}$/i));
}

function githubApiUrl(sourceRepo: string): string {
  const url = new URL(sourceRepo);
  const [owner, repo] = url.pathname.replace(/^\//, '').split('/');
  if (url.hostname !== 'github.com' || !owner || !repo) {
    throw new Error(`unsupported add-on source repo: ${sourceRepo}`);
  }
  return `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return (await res.json()) as T;
}

type AddOnRegistrySourceEntry = AddOnCatalogEntry | AddOnRegistryEntry;

function isResolvedEntry(entry: AddOnRegistrySourceEntry): entry is AddOnRegistryEntry {
  return 'zipUrl' in entry && 'checksum' in entry && 'releasePage' in entry && 'version' in entry;
}

async function readRegistrySource(): Promise<AddOnRegistrySourceEntry[]> {
  if (config.addonRegistryUrl) return getJson<AddOnRegistrySourceEntry[]>(config.addonRegistryUrl);

  try {
    return await getJson<AddOnRegistrySourceEntry[]>(DEFAULT_REGISTRY_URL);
  } catch {
    return JSON.parse(await readFile(LOCAL_REGISTRY_PATH, 'utf8')) as AddOnRegistrySourceEntry[];
  }
}

async function resolveRegistryEntry(entry: AddOnRegistrySourceEntry): Promise<AddOnRegistryEntry> {
  if (isResolvedEntry(entry)) return entry;

  const release = await getJson<GitHubRelease>(githubApiUrl(entry.sourceRepo));
  const version = versionFromTag(release.tag_name);
  const zipName = patternForVersion(entry.assetPattern, version);
  const zip = release.assets.find((asset) => asset.name === zipName);

  if (!zip) throw new Error(`${entry.name} release is missing ${zipName}`);
  if (!isSha256Digest(zip.digest))
    throw new Error(`${entry.name} release asset is missing a sha256 digest`);

  return {
    ...entry,
    version,
    releasePage: release.html_url,
    zipUrl: zip.browser_download_url,
    checksum: zip.digest,
  };
}

export async function listAddOnRegistry(): Promise<AddOnRegistryEntry[]> {
  const source = await readRegistrySource();
  return Promise.all(source.map(resolveRegistryEntry));
}

export async function findAddOnRegistryEntry(
  name: string | undefined,
): Promise<AddOnRegistryEntry | undefined> {
  if (!name) return undefined;
  const entry = (await readRegistrySource()).find((addon) => addon.name === name);
  return entry ? resolveRegistryEntry(entry) : undefined;
}
