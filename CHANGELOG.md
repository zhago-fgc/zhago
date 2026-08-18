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

- ✨ Static JSON add-on registry with official match, caster, start.gg, overlay, and game add-ons.
- ✨ Add-ons page registry listings with install, update, remove, trust signals, status, and restart guidance.
- 👷 GitHub Actions CI for pull requests and releases, including binary artifacts and GHCR images.
- ✨ Native Add-ons and Logs pages in the admin console.
- ✅ Bun tests for overlay helpers, log parsing, registry loading, and embedded assets.
- ✨ Game data modules for 2XKO, SF6, KOF XV, and Fatal Fury: City of the Wolves.
- ✨ Neon Grid example overlay pack.
- ✨ Live-swappable overlay pack system with a shipped default pack.
- ✨ start.gg module for tournament and event lookup.
- ✨ Reworked match — overlay packs, per-player teams, cockpit fixes.
- ✨ Reworked casters — overlay packs, full commentator profiles, directory
  sync.
- ✨ Inline editing in the caster directory cockpit.
- 💄 Shared Bootstrap-based cockpit design system.

### Changed

- ♻️ Removed bundled repo modules from core and load add-ons from the Zhago data directory.
- 🎨 Changed the default admin theme to system.
- 📝 Updated alpha Getting Started docs and TODO progress tracking.
- 📦 Embedded core runtime assets into the compiled binary and moved module cockpit shared assets to `/assets/*`.
- 🏗️ Reorganized the native Vue admin app around feature folders and shared API/type layers.
- 🏗️ Split overlay registry helpers out of route handlers.
- 🛠️ Switched local dev data to repo-local `.zhago/` and added `just lint`, `just test`, `just format`, and `just format-check`.
- 🏗️ Split core into `bus`/`loader`/`logger`/`paths`/`storage`, plus a
  typed `config` and `registry`.
- 🏗️ Replaced the Wails v2 desktop app with a Bun server and a module/plugin
  architecture: each feature (match state, casters, caster directory) is a
  module with its own backend logic and its own cockpit/overlay UI, loaded
  from a `modules/` directory next to the binary rather than baked into it.
- ✨ Added app theming, a cockpit skin system, and a Settings view.
- 📝 Rewrote the README to match the project's current early/prototype state.
- 🎨 Restored the logo asset the Bun rewrite had dropped.
- 🎨 Added ESLint, Prettier, and EditorConfig, and reformatted the existing
  codebase to match.
- 🐳 Added a Containerfile (Alpine-based) and a musl build target
  (`just build-linux-musl <x64|arm64>`) for it.
- 📦 Added a devcontainer (bun + just on a bookworm base).
- 🔥 Removed leftover Wails build output (`bin/`) and empty pre-rewrite
  directories (`internal/`, `templates/`).

### Fixed

- 🐛 Embedded the static add-on registry in compiled binaries.

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
