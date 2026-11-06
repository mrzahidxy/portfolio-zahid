# Portfolio view socket

An Express and WebSocket service that stores the visit count in MongoDB. The REST API reads and increments the count; WebSocket clients receive the current count on connection and updates after increments.

## Local setup

From this directory, install dependencies and copy `.env.example` to `.env`:

```bash
npm install
cp .env.example .env
npm run dev
```

Set `MONGODB_URI` to a reachable database. The example uses development settings, allows the portfolio at `http://localhost:3030`, and listens on port 8080. The portfolio example points to this service on the same port; update its `NEXT_PUBLIC_VISIT_API_URL` and `NEXT_PUBLIC_WEBSOCKET_URL` if you change the service address.

## Endpoints

- `POST /api/visit` increments the count and broadcasts the result.
- `GET /api/visit` returns the current count without changing it.
- WebSocket messages have the shape `{ "type": "visit_count", "count": 1 }`.
- `GET /health` and `GET /ready` return 200 when MongoDB is connected and 503 otherwise.

## Deployment

The GitHub Actions workflow builds and pushes a Docker image, then deploys it to a VPS using Docker Compose. Set `NODE_ENV=production`, `MONGODB_URI`, and `ALLOWED_ORIGINS` in production; the latter accepts comma-separated allowed origins. The included `render.yaml` is an alternative starting point for Render, but its environment and build settings must be configured for production: set `ALLOWED_ORIGINS` and build the TypeScript app with `npm run build` before `npm start`.
