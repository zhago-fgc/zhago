import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { config } from '../config';
import type { ModuleManifest } from '../types';

export interface AddOnCatalogEntry extends Omit<ModuleManifest, 'entry' | 'ui'> {
  repo: string;
  official?: boolean;
  recommended?: boolean;
}

export interface AddOnRegistryEntry extends ModuleManifest {
  repo: string;
  sourceRepo: string;
  releasePage: string;
  zipUrl: string;
  checksumUrl: string;
  checksum?: `sha256:${string}`;
  official?: boolean;
  recommended?: boolean;
}

const DEFAULT_REGISTRY_URL = 'https://zhago-fgc.github.io/zhago/registry.json';
const LOCAL_REGISTRY_PATH = 'registry.json';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} failed with ${res.status}`);
  return (await res.json()) as T;
}

function releaseTag(version: string): string {
  return version.startsWith('v') ? version : `v${version}`;
}

function releaseAssetBase(repo: string): string {
  return basename(new URL(repo).pathname);
}

function expandCatalogEntry(entry: AddOnCatalogEntry): AddOnRegistryEntry {
  const tag = releaseTag(entry.version);
  const assetBase = releaseAssetBase(entry.repo);
  return {
    ...entry,
    repo: entry.repo,
    sourceRepo: entry.repo,
    releasePage: `${entry.repo}/releases/tag/${tag}`,
    zipUrl: `${entry.repo}/releases/download/${tag}/${assetBase}.zip`,
    checksumUrl: `${entry.repo}/releases/download/${tag}/${assetBase}.sha256`,
  };
}

async function readCatalog(): Promise<AddOnCatalogEntry[]> {
  if (config.addonRegistryUrl) return getJson<AddOnCatalogEntry[]>(config.addonRegistryUrl);

  try {
    return JSON.parse(await readFile(LOCAL_REGISTRY_PATH, 'utf8')) as AddOnCatalogEntry[];
  } catch {
    return getJson<AddOnCatalogEntry[]>(DEFAULT_REGISTRY_URL);
  }
}

export async function listAddOnRegistry(): Promise<AddOnRegistryEntry[]> {
  return (await readCatalog()).map(expandCatalogEntry);
}

export async function findAddOnRegistryEntry(
  name: string | undefined,
): Promise<AddOnRegistryEntry | undefined> {
  if (!name) return undefined;
  const entry = (await readCatalog()).find((addon) => addon.name === name);
  return entry ? expandCatalogEntry(entry) : undefined;
}
