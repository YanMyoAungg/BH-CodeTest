FROM node:20-slim AS base
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 make g++ && \
    rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10
WORKDIR /app

FROM base AS server-deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN pnpm install --no-frozen-lockfile --filter server

FROM base AS client-build
ARG VITE_API_URL=http://localhost:3000/graphql
ARG VITE_TOKEN_NAME=better_hr_token
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TOKEN_NAME=${VITE_TOKEN_NAME}
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN pnpm install --no-frozen-lockfile --filter client
COPY client/ client/
RUN pnpm --filter client build

FROM server-deps AS server
ENV NODE_ENV=production
ENV PORT=3000
COPY server/ server/
COPY server/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]

FROM node:20-slim AS client
RUN npm install -g serve
WORKDIR /app
COPY --from=client-build /app/client/dist ./dist
EXPOSE 3001
CMD ["serve", "dist", "--single", "--listen", "3001", "--no-clipboard"]

FROM base AS client-build-fly
ARG VITE_API_URL=
ARG VITE_TOKEN_NAME=better_hr_token
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TOKEN_NAME=${VITE_TOKEN_NAME}
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY client/package.json client/
COPY server/package.json server/
RUN pnpm install --no-frozen-lockfile --filter client
COPY client/ client/
RUN pnpm --filter client build

FROM server-deps AS fly
RUN apt-get update && \
    apt-get install -y --no-install-recommends nginx && \
    rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV PORT=4000
COPY server/ server/
COPY --from=client-build-fly /app/client/dist /app/client/dist
COPY nginx.conf /etc/nginx/sites-available/default
COPY fly-entrypoint.sh /fly-entrypoint.sh
RUN chmod +x /fly-entrypoint.sh && \
    rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
EXPOSE 3000
CMD ["/fly-entrypoint.sh"]
