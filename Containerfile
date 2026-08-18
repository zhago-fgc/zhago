# Expects musl-target binaries to already be built on the host or in release CI.
# The image chooses the right binary from Docker's target platform.
FROM alpine:3.20
RUN apk add --no-cache ca-certificates libstdc++ libgcc

ARG TARGETARCH
WORKDIR /app
COPY build/zhago-linux-x64-musl /tmp/zhago-linux-x64-musl
COPY build/zhago-linux-arm64-musl /tmp/zhago-linux-arm64-musl
RUN case "$TARGETARCH" in \
      amd64) cp /tmp/zhago-linux-x64-musl /app/zhago ;; \
      arm64) cp /tmp/zhago-linux-arm64-musl /app/zhago ;; \
      *) echo "unsupported architecture: $TARGETARCH" >&2; exit 1 ;; \
    esac \
    && chmod +x /app/zhago \
    && rm /tmp/zhago-linux-x64-musl /tmp/zhago-linux-arm64-musl
COPY build/modules /app/modules

ENV ZHAGO_DIR=/data
# Verbose by default here — stdout via `docker logs` is the normal way anyone
# observes a container, unlike the compiled binary's quiet ("warn") default.
ENV ZHAGO_LOG_LEVEL=info
VOLUME /data
EXPOSE 3210

ENTRYPOINT ["/app/zhago"]
