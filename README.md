# Portfolio monorepo

Three independently configured and deployed apps make up the portfolio:

- [Portfolio](portfolio/README.md): Next.js public site and admin area.
- [Chatbot](chatbot/README.md): Next.js chatbot API and embeddable widget.
- [View socket](view-socket/README.md): Express and WebSocket visit counter backed by MongoDB.

The portfolio embeds the chatbot widget and connects to the visit counter using URLs configured in `portfolio/.env.example`. Each app has its own dependencies and environment file; see its README for setup.

## Quick start

Copy each app's `.env.example` to the environment file named in its README and configure the services you need. Then run each app from its own directory:

```bash
cd portfolio && npm install && npm run dev
cd chatbot && npm install && npm run dev
cd view-socket && npm install && npm run dev
```

Run these commands in separate terminals, starting each from the repository root. The portfolio runs on port 3030, the chatbot on 3000, and the visit counter on 8080 by default. MongoDB is needed for the visit counter and database-backed portfolio features; the chatbot needs a Groq API key.

## Deployment

GitHub Actions checks and builds the Next.js apps, and deploys their preview and production versions to separate Vercel projects. Portfolio deployment uses `VERCEL_TOKEN`, `PORTFOLIO_VERCEL_ORG_ID`, and `PORTFOLIO_VERCEL_PROJECT_ID`; chatbot deployment uses the same token with `CHATBOT_VERCEL_ORG_ID` and `CHATBOT_VERCEL_PROJECT_ID`.

The view socket workflow builds a Docker image and deploys it to a VPS. A Render configuration is also included; see the [service README](view-socket/README.md).
