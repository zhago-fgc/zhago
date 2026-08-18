<div align="center">
    <img src="./img/logo.svg" alt="" width="100px" align="center" />
    <h1 align="center">Zhago</h1>
    <p align="center">
        <a href="./LICENSE"><img src="https://img.shields.io/github/license/zhago-fgc/zhago?style=for-the-badge&color=white&labelColor=333333" alt="License"></a>
        <a href="https://github.com/zhago-fgc/zhago/releases"><img src="https://img.shields.io/github/v/release/zhago-fgc/zhago?include_prereleases&style=for-the-badge&color=white&labelColor=333333" alt="Latest release"></a>
        <a href="https://bun.sh"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fzhago-fgc%2Fzhago%2Fmain%2Fpackage.json&query=%24.packageManager&style=for-the-badge&logo=bun&logoColor=white&label=Bun&color=white&labelColor=333333" alt="Bun version"></a>
        <a href="https://vuejs.org"><img src="https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&labelColor=333333" alt="Vue"></a>
    </p>
</div>

Zhago is a self-hosted production toolkit for FGC tournament organizers: scoreboards,
overlays, and other match tools, run from a single Bun server instead of a pile of
browser-source hacks and spreadsheets.

Zhago started as a Wails desktop app. This rewrite drops the desktop shell for a Bun
server with a plugin architecture: each piece of functionality (match state, casters,
caster directory) is a module with its own backend logic and its own UI, loaded from a
`modules/` directory next to the binary. Nothing about the module system is baked into
the executable, so modules can be added or swapped without rebuilding it.

This is early and still taking shape. Treat it as a prototype, not a finished product.

## What does Zhago offer?

- **Single binary**: a Bun server you run directly, no separate services to babysit.
- **Modules**: each module ships its own cockpit UI (for the operator) and, optionally,
  an overlay UI (for OBS), talking to the backend over an in-process event bus.
- **Hot-loadable**: modules live in a real directory on disk, scanned at startup, so
  they can be dropped in or updated without touching the binary.
- **Vue frontend**: the operator-facing app and each module's UI are built with Vue 3
  and Tailwind.
- **Self-hosted, always**: your data stays on your machine.

## Getting started

Requires [Bun](https://bun.sh) and [just](https://github.com/casey/just).

```bash
just install
just watch
```

This runs the backend (`src/server.ts`) and the frontend dev server together. To build
a standalone binary:

```bash
just build
./build/zhago
```

## Development

```bash
just typecheck   # typecheck backend and frontend
just clean       # remove build output
```

Each module lives under `modules/<name>/` with a `module.json` manifest declaring its
entry point and UI paths. See `modules/match` for a working example.

## License

Zhago is licensed under the [MIT License](./LICENSE).

## Get involved

Zhago is early and actively changing shape. Bug reports, ideas, and pull requests are
welcome — open an issue or PR on this repo.
