package bootstrap

import (
	"embed"
	"io/fs"
	"os"
	"path/filepath"
)

// EnsureDefaultTemplates extracts the embedded default-minimal pack to
// ~/.zhago/templates/default-minimal/ on first run. Existing files are never
// overwritten, so user customizations survive app updates.
func EnsureDefaultTemplates(embeddedFS embed.FS) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	destBase := filepath.Join(home, ".zhago", "templates")

	const srcRoot = "templates/default-minimal"

	return fs.WalkDir(embeddedFS, srcRoot, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, err := filepath.Rel(srcRoot, path)
		if err != nil {
			return err
		}
		dest := filepath.Join(destBase, "default-minimal", rel)

		if d.IsDir() {
			return os.MkdirAll(dest, 0755)
		}

		// Skip files that already exist — don't overwrite user customizations.
		if _, err := os.Stat(dest); err == nil {
			return nil
		}

		data, err := embeddedFS.ReadFile(path)
		if err != nil {
			return err
		}
		return os.WriteFile(dest, data, 0644)
	})
}
