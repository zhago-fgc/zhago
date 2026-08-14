app := "app"
# Dev/test runs never touch the real ~/.zhago (predates this rewrite, holds
# real data from the Wails app) — everything here lands in a throwaway,
# gitignored dir instead. Unset in a real install/build, where it correctly
# falls back to ~/.zhago.
dev_data := justfile_directory() + "/.dev-data"

watch:
    #!/usr/bin/env sh
    trap 'kill 0' EXIT
    just watch-backend &
    backend=$!
    just watch-frontend &
    frontend=$!
    # No `wait -n` here — this box only has bash 3.2 (macOS system default,
    # no Homebrew bash installed), which predates it. Polling both PIDs gets
    # the same effect in plain sh: as soon as either dies, stop waiting, hit
    # the EXIT trap, and kill 0 takes down whichever one is still alive.
    while kill -0 "$backend" 2>/dev/null && kill -0 "$frontend" 2>/dev/null; do
        sleep 1
    done

watch-backend: generate-ui-embed
    ZHAGO_DIR={{dev_data}} bun run --watch src/server.ts

watch-frontend:
    cd {{app}} && bun run vite

build: build-frontend generate-ui-embed build-backend

build-backend:
    bun build --compile src/server.ts --outfile build/zhago
    # Modules go through dynamic import() (needed for hot-load), which --compile
    # can't embed — they ship as a real directory next to the binary instead.
    cp -r modules build/modules

# musl target so the binary runs on Alpine (the container's base image) without
# dragging in glibc. arch is a Bun --compile target suffix: x64 or arm64.
build-linux-musl arch:
    bun build --compile --target=bun-linux-{{arch}}-musl src/server.ts --outfile build/zhago-linux-{{arch}}-musl
    cp -r modules build/modules

build-frontend:
    cd {{app}} && bun run vue-tsc -b && bun run vite build

# Bun's --compile has no directory/glob embed — this generates one static
# `import ... with { type: "file" }` per file in app/dist so --compile picks
# them all up. Writes an empty map if app/dist doesn't exist (dev mode doesn't
# need it; Vite serves the UI directly).
generate-ui-embed:
    bun run scripts/generate-ui-embed.ts

typecheck: typecheck-core typecheck-app

typecheck-core:
    bun run tsc --noEmit

typecheck-app:
    cd {{app}} && bun run vue-tsc -b

install:
    bun install

# Run the compiled binary against the same throwaway dev data as `just watch`
# — for testing the build itself without ever touching the real ~/.zhago.
run-built:
    ZHAGO_DIR={{dev_data}} ./build/zhago

clean:
    rm -rf build app/dist .gen .dev-data
