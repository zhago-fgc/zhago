import { readFile } from 'node:fs/promises';

type RegistryEntry = {
  name?: unknown;
  displayName?: unknown;
  type?: unknown;
  sourceRepo?: unknown;
  assetPattern?: unknown;
  official?: unknown;
  recommended?: unknown;
  tags?: unknown;
  entry?: unknown;
  ui?: unknown;
};

const allowedTypes = new Set(['module', 'plugin', 'overlay']);
const registry = JSON.parse(await readFile('registry.json', 'utf8')) as unknown;

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
  if (typeof addon.type !== 'string' || !allowedTypes.has(addon.type))
    throw new Error(`${prefix}.type must be module, plugin, or overlay`);
  if (typeof addon.sourceRepo !== 'string' || !addon.sourceRepo.startsWith('https://github.com/'))
    throw new Error(`${prefix}.sourceRepo must be a GitHub URL`);
  if (typeof addon.assetPattern !== 'string' || !addon.assetPattern.includes('{version}'))
    throw new Error(`${prefix}.assetPattern must include {version}`);
  if (addon.type !== 'overlay' && typeof addon.entry !== 'string')
    throw new Error(`${prefix}.entry is required for runnable add-ons`);
  if (addon.tags !== undefined && !Array.isArray(addon.tags))
    throw new Error(`${prefix}.tags must be an array`);
}

console.log(`registry ok: ${registry.length} add-ons`);
