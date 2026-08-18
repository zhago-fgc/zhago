import { readFile } from 'node:fs/promises';

type RegistryEntry = {
  name?: unknown;
  displayName?: unknown;
  version?: unknown;
  type?: unknown;
  repo?: unknown;
  official?: unknown;
  recommended?: unknown;
  tags?: unknown;
  entry?: unknown;
  ui?: unknown;
};

const allowedTypes = new Set(['module', 'plugin', 'overlay']);
const registry = JSON.parse(await readFile('registry.json', 'utf8')) as unknown;

function isUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

if (!Array.isArray(registry)) throw new Error('registry must be an array');

const names = new Set<string>();
for (const [index, entry] of registry.entries()) {
  const addon = entry as RegistryEntry;
  const prefix = `registry[${index}]`;

  if (typeof addon.name !== 'string' || !addon.name) throw new Error(`${prefix}.name is required`);
  if (names.has(addon.name)) throw new Error(`duplicate add-on name: ${addon.name}`);
  names.add(addon.name);

  if (typeof addon.displayName !== 'string' || !addon.displayName)
    throw new Error(`${prefix}.displayName is required`);
  if (typeof addon.version !== 'string' || !addon.version)
    throw new Error(`${prefix}.version is required`);
  if (typeof addon.type !== 'string' || !allowedTypes.has(addon.type))
    throw new Error(`${prefix}.type must be module, plugin, or overlay`);
  if (!isUrl(addon.repo)) throw new Error(`${prefix}.repo must be a URL`);
  if (addon.entry !== undefined) throw new Error(`${prefix}.entry belongs in module.json`);
  if (addon.ui !== undefined) throw new Error(`${prefix}.ui belongs in module.json`);
  if (addon.tags !== undefined && !Array.isArray(addon.tags))
    throw new Error(`${prefix}.tags must be an array`);
}

console.log(`registry ok: ${registry.length} add-ons`);
