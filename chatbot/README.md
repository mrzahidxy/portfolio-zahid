# Portfolio chatbot

A standalone Next.js chatbot with a test page at `/`, an iframe-ready widget at `/widget`, and a Groq-backed API at `/api/chat`.

## Local setup

Node.js 20.9 or newer is required. From this directory:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `GROQ_API_KEY` in `.env.local`, then open [http://localhost:3000](http://localhost:3000) or [the widget](http://localhost:3000/widget). `GROQ_MODEL` is optional and defaults to `openai/gpt-oss-20b`. `NEXT_PUBLIC_PORTFOLIO_URL` configures the portfolio link; replace its local value with the deployed portfolio URL in production.

Update the assistant's portfolio information in `src/data/portfolio-context.ts`.

## API and rate limiting

`POST /api/chat` accepts a conversation ending in a user message:

```json
{ "messages": [{ "role": "user", "content": "Who is Zahid?" }] }
```

A successful response is `{ "reply": "..." }`. The API accepts up to the last 10 messages, limits message content to 1,000 characters, and allows 20 requests per IP per 60 seconds.

Local development can use an in-memory limiter. In production, both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are required; the API returns 503 if Redis is missing or unavailable. The Groq key remains server-side.

To check Upstash directly, run the following with those variables set in your shell:

```bash
curl "$UPSTASH_REDIS_REST_URL/ping" \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

The expected response is `{"result":"PONG"}`. To check the app's limit locally, with `GROQ_API_KEY` configured, send repeated requests:

```bash
for i in {1..25}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[]}'
done
```

Initially the invalid request returns 400; after the limit is reached it returns 429. To confirm Redis is being used, check the Upstash dashboard for command activity or keys beginning with `rate-limit:`.

## Integration and deployment

Deploy the app as a separate Vercel project and configure its environment variables there. Set `NEXT_PUBLIC_CHATBOT_WIDGET_URL` in the portfolio app to the deployed `/widget` URL. The widget can also be embedded directly:

```html
<iframe src="https://YOUR_CHATBOT_DOMAIN/widget" title="Portfolio chatbot" width="400" height="600" style="border:0;"></iframe>
```

Run `npm run lint` and `npm run build` to check changes.

After deployment, open the deployed `/` and `/widget` pages and send a test request to `/api/chat`. Confirm that the widget loads in the portfolio and returns a response.
