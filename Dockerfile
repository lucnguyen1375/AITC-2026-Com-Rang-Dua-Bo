FROM node:22-alpine AS frontend-build

WORKDIR /frontend
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
COPY chung-khao/tro-ly-dinh-duong/package.json chung-khao/tro-ly-dinh-duong/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY chung-khao/tro-ly-dinh-duong/ ./
RUN pnpm build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FRONTEND_DIST=/app/chung-khao/tro-ly-dinh-duong/dist

WORKDIR /app
COPY chung-khao/chat-core/requirements.txt ./chung-khao/chat-core/requirements.txt
RUN python -m pip install --no-cache-dir -r chung-khao/chat-core/requirements.txt
COPY chung-khao/chat-core/ ./chung-khao/chat-core/
COPY --from=frontend-build /frontend/dist/ ./chung-khao/tro-ly-dinh-duong/dist/

WORKDIR /app/chung-khao/chat-core
EXPOSE 3000
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-3000}"]
