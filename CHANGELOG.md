# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
uses [Gitmoji](https://gitmoji.dev/) in commit messages.

History prior to this file was not itemized commit-by-commit — the entries
below summarize the full development history into two retrospective blocks:
the original Wails v2 desktop app, and the Bun rewrite that replaced it.
From here on, new changes should be added under `[Unreleased]` as they land.

## [Unreleased]

### Added

- ✨ Added the match-history module (0.1.1) — records an immutable per-game/per-match log automatically when Match declares a winner. Cockpit supports multi-select and bulk delete.
- ✨ Added the players module (0.1.0) — player roster with a profile computed live from match-history (win/loss, character usage per game).

### Changed

- 🎨 Redesigned the default overlay pack's match skin (0.3.0) with a pixel-accurate chevron layout.
- ✨ Bumped match to 0.3.2 — per-game score tracking, manual winner declaration, swap/clear, and players integration.

### Fixed

- 🐛 Fixed shared cockpit `.field-row` buttons shrinking below their own text in crowded rows (e.g. Caster Directory's Add button).
- 🐛 Fixed a relative `ZHAGO_DIR` (e.g. `.zhago`) breaking module loading entirely — the loader's dynamic `import()` needs an absolute path regardless of run mode.
- 📱 Fixed match's score stepper/winner/loser row breaking in narrow panes and OBS custom browser docks — settled on keeping the whole row on one compact line (match 0.3.2).

## [0.1.8] - 2026-08-19

### Fixed

- 🐛 Fixed the cotw registry entry using the repo slug instead of the module's actual name, which broke install.
- 🐛 Restored native-resolution preview iframe scaling in module cockpits, fixing broken overlay layout in previews.
- 🐛 Wrapped the match and casters module previews in a collapsible panel so the mobile "Show preview" toggle works.
- 🐛 Bumped match, casters, and the default overlay pack in the registry to their fixed releases (0.2.1, 0.2.1, 0.2.0).

## [0.1.7] - 2026-08-18

### Added

- 📱 Made shared cockpit CSS responsive for narrow panes and preview frames.
- 📱 Added a small-screen admin menu in place of the horizontal nav.
- 📱 Improved responsive layouts for the home, add-ons, logs, and settings views.
- ✨ Only show add-on updates when the registry version is newer than the installed one.

### Changed

- ♻️ Derive add-on release URLs from a compact registry with repo and pinned version fields.
- ♻️ Publish the root registry file directly without GitHub API resolution.

### Fixed

- 🐛 Updated The King of Fighters XV display name in the registry.

## [0.1.6] - 2026-08-18

### Fixed

- 🐛 Publish a fully resolved registry so clients do not hit GitHub API rate limits.

## [0.1.5] - 2026-08-18

### Added

- ✨ Publish the add-on registry to GitHub Pages.

### Changed

- ♻️ Move the add-on registry to the repo root and resolve add-on versions from GitHub releases.

## [0.1.4] - 2026-08-18

### Added

- ✨ Add live add-on loading after install, update, and remove.
- ✨ Log add-on install, update, remove, reload, and unload events.

## [0.1.3] - 2026-08-18

### Changed

- 🔧 Enabled auto-generated GitHub release notes.
- 📄 Added a README CI badge for pull request build state.

### Fixed

- 🐛 Fixed add-on installs across filesystem devices in containers.
- 🐛 Log add-on install, update, and remove failures.

## [0.1.2] - 2026-08-18

### Fixed

- 🐛 Removed the installer dependency on a system `unzip` command.

## [0.1.1] - 2026-08-18

### Fixed

- 🐛 Embedded the static add-on registry in compiled binaries.

## [0.1.0] - 2026-08-18

### Added

- ✨ Static JSON add-on registry with official match, caster, start.gg, overlay, and game add-ons.
- ✨ Add-ons page registry listings with install, update, remove, trust signals, status, and restart guidance.
- 👷 GitHub Actions CI for pull requests and releases, including binary artifacts and GHCR images.
- ✨ Native Add-ons and Logs pages in the admin console.
- ✅ Bun tests for overlay helpers, log parsing, registry loading, and embedded assets.
- ✨ Game data modules for 2XKO, SF6, KOF XV, and Fatal Fury: City of the Wolves.
- ✨ Neon Grid example overlay pack.
- ✨ Live-swappable overlay pack system with a shipped default pack.
- ✨ start.gg module for tournament and event lookup.
- ✨ Reworked match, including overlay packs, per-player teams, and cockpit fixes.
- ✨ Reworked casters, including overlay packs, full commentator profiles, and directory sync.
- ✨ Inline editing in the caster directory cockpit.
- 💄 Shared Bootstrap-based cockpit design system.

### Changed

- ♻️ Removed bundled repo modules from core and load add-ons from the Zhago data directory.
- 🎨 Changed the default admin theme to system.
- 📝 Updated alpha Getting Started docs.
- 📦 Embedded core runtime assets into the compiled binary and moved module cockpit shared assets to `/assets/*`.
- 🏗️ Reorganized the native Vue admin app around feature folders and shared API/type layers.
- 🏗️ Split overlay registry helpers out of route handlers.
- 🛠️ Switched local dev data to repo-local `.zhago/` and added `just lint`, `just test`, `just format`, and `just format-check`.
- 🏗️ Split core into `bus`/`loader`/`logger`/`paths`/`storage`, plus a typed `config` and `registry`.
- 🏗️ Replaced the Wails v2 desktop app with a Bun server and module/plugin architecture.
- ✨ Added app theming, a cockpit skin system, and a Settings view.
- 📝 Rewrote the README to match the project's current early/prototype state.
- 🎨 Restored the logo asset the Bun rewrite had dropped.
- 🎨 Added ESLint, Prettier, and EditorConfig, and reformatted the existing codebase to match.
- 🐳 Added a Containerfile and a musl build target (`just build-linux-musl <x64|arm64>`).
- 📦 Added a devcontainer.
- 🔥 Removed leftover Wails build output (`bin/`) and empty pre-rewrite directories (`internal/`, `templates/`).

## [Wails v2] - 2025-09-07 to 2026-04-09

Retrospective summary of the original desktop app, before the Bun rewrite.

### Added

- 🎉 Initial Wails v2 + Go + Vue desktop app.
- ✨ HTTP server for static files and SSE-driven overlays.
- 🗃️ Storage migrated BoltDB → SQLite (GORM).
- 🏗️ Domain models, repository interfaces, and DTOs (clean architecture).
- ✨ SSE hub with fan-out and server lifecycle bindings.
- ✨ Player, commentator, tournament, and set management, each with CRUD
  and a bracket view.
- ✨ Pack-based template system replacing the static overlay handler.
- ✨ Asset management handler and view.
- 🎨 Frontend redesign: new nav, views, and Pinia stores.
- ✨ Start.gg tournament import, with a token-management UI and player
  stats aggregation.

### Fixed

- 🐛 Bracket set ordering by round number.
- 🐛 Player deduplication by tag match on Start.gg import.
- 🐛 Round order and external ID stored on import for correct bracket
  ordering.
- 🐛 Start.gg import reliability and navbar token sync.
