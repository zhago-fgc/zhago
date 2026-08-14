FROM mcr.microsoft.com/devcontainers/base:bookworm

# bun (runtime, package manager, dev server, build, --compile)
ENV BUN_INSTALL=/usr/local/bun
ENV PATH=${BUN_INSTALL}/bin:${PATH}
RUN mkdir -p ${BUN_INSTALL} && chmod 755 ${BUN_INSTALL} \
    && curl -fsSL https://bun.sh/install | bash \
    && chmod -R a+rX ${BUN_INSTALL}

# just (task runner used by the justfile)
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh \
    | bash -s -- --to /usr/local/bin
