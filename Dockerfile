FROM oven/bun:latest AS base

LABEL org.opencontainers.image.title="NetGoat"
LABEL org.opencontainers.image.description="Production container for NetGoat (Backend + Extra Tools)"
LABEL org.opencontainers.image.authors="Duckey Dev <ducky@cloudable.dev>"
LABEL org.opencontainers.image.source="https://github.com/netgoat-xyz/BracketDNS"

WORKDIR /app

# Optional: install packages you used to grab via Ubuntu
# bun images are Debian-based, so apt works fine
RUN apt-get update && \
    apt-get install -y dnsutils curl && \
    apt-get clean

# Copy everything
COPY package.json .
COPY bun.lockb .
COPY .env .
COPY src ./src
COPY index.js index.js

# Install app deps
RUN bun install --production

# Ports
EXPOSE 80
EXPOSE 443
EXPOSE 3001

ENV NODE_ENV=production

# Start backend
CMD ["bun", "src/server.js"]