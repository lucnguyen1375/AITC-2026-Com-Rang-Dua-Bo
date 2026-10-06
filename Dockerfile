FROM node:22-alpine

WORKDIR /app/chung-khao/tro-ly-dinh-duong
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY chung-khao/tro-ly-dinh-duong/package.json chung-khao/tro-ly-dinh-duong/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY chung-khao/tro-ly-dinh-duong/ ./
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 5173
CMD ["sh", "-c", "pnpm start --host 0.0.0.0 --port \"${PORT:-5173}\""]
