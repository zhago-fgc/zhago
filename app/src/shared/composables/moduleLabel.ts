export interface LabeledModule {
  name: string;
  displayName?: string;
}

// A module author sets `displayName` for anything the plain slug wouldn't
// read well as ("startgg" -> "start.gg", "caster-directory" -> "Caster
// Directory") — everything else falls back to title-casing the slug itself.
export function moduleLabel(m: LabeledModule): string {
  return (
    m.displayName ??
    m.name
      .split('-')
      .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
      .join(' ')
  );
}
