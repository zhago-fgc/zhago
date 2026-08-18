# TODO

## Alpha distribution

- [ ] Build the binary plus in-app installer flow.
- [x] Make the core app boot cleanly with zero installed add-ons.
- [x] Keep the user-facing alpha contract simple: download binary, open Add-ons, install what is needed.

## Registry and add-on install

- [x] Draft the first `registry.json` schema before coding install.
- [x] Add a static registry source, initially local or in a separate VitePress docs repo.
- [x] Add `GET /api/addons/registry`.
- [x] Add `POST /api/addons/install`.
- [x] Download add-on zips with plain `fetch` from pinned release URLs.
- [x] Verify zip checksums before install.
- [x] Extract add-ons into `ZHAGO_DIR/modules/<manifest.name>`.
- [x] Track installed add-ons, versions, source URLs, and checksums.
- [x] Decide whether alpha install requires restart or supports live rescan.
- [ ] Move the static registry into hosted `registry.json`.
- [ ] Add installer tests for checksum mismatch, manifest mismatch, and successful extraction.

## Add-ons page

- [x] Show registry entries, not only installed modules.
- [x] Add official/recommended section.
- [ ] Add install, remove, and update actions.
- [x] Show install status, errors, and restart/rescan guidance.
- [ ] Add trust signals: source repo, version, checksum, tags, and permissions when available.
- [ ] Make Install recommended install all recommended add-ons.

## Logs page

- [ ] Add copy/export logs action for support.
- [ ] Add source and level quick filters.
- [ ] Consider reading rotated log files newest-first for large logs.
- [ ] Improve empty/error states when log files cannot be read.

## Registry/docs repo

- [ ] Create the VitePress registry/docs repo.
- [ ] Host `registry.json` from GitHub Pages or raw GitHub.
- [ ] Document how to publish an add-on.
- [ ] Document release zip shape and checksum requirements.
- [ ] Add PR validation for registry entries.
- [ ] Optionally run Trivy on submitted add-on repos.

## CI and releases

- [ ] Validate the release workflow on a real tag.
- [ ] Confirm Linux, macOS, Windows, and musl binaries run.
- [ ] Confirm GHCR multi-arch image pushes correctly.
- [ ] Decide whether prerelease tags like `0.1.0-alpha.1` should mark GitHub releases as prereleases automatically.
- [ ] Add smoke tests for compiled binaries if needed.

## Future cleanup

- [ ] Split add-on install logic into its own backend module when implemented.
- [ ] Keep route handlers thin and move testable logic into helpers.
- [ ] Add more tests around module install, registry parsing, and rescan behavior.
- [ ] Consider a shared native UI component layer if Add-ons and Logs keep growing.

## Future product work

- [ ] Move optional modules to separate repos once installer flow is stable.
- [ ] Build the standard tournament toolkit install preset.
- [ ] Add manual add-on update flow. Never silently auto-update.
- [ ] Add add-on permissions metadata.
- [ ] Add dashboard/cards for loaded add-ons.
- [ ] Separate “has cockpit” from “show in sidebar”.
