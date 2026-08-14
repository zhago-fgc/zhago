# Expects the musl-target binary to already be built on the host via
# `just build-linux-musl <x64|arm64>` — see justfile. Keeps the container
# build from duplicating what the release job already produces per-arch.
ARG ARCH=arm64

FROM alpine:3.20
RUN apk add --no-cache ca-certificates libstdc++ libgcc

ARG ARCH
WORKDIR /app
COPY build/zhago-linux-${ARCH}-musl /app/zhago
COPY build/modules /app/modules

ENV ZHAGO_DIR=/data
# Verbose by default here — stdout via `docker logs` is the normal way anyone
# observes a container, unlike the compiled binary's quiet ("warn") default.
ENV ZHAGO_LOG_LEVEL=info
VOLUME /data
EXPOSE 3210

ENTRYPOINT ["/app/zhago"]
