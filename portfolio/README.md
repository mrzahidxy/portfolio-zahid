# Portfolio

The Next.js app serves the public portfolio and an admin area for managing profile content, projects, and experience. MongoDB stores editable content; the public site also has fallback content in `src/data/profile.json`.

## Local setup

From this directory, install dependencies, copy `.env.example` to `.env.local`, and fill in the values needed for your features:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3030](http://localhost:3030). The environment example lists database and admin secrets, Cloudinary credentials for uploads, public URLs for the chatbot and visit counter, and EmailJS keys for the contact form. Configure `MONGODB_URI`, `PASS_SEC`, and `JWT_SEC` for database-backed admin features.

The example points to the chatbot on port 3000 and the visit counter on port 8080, matching their local examples. Replace these and `NEXT_PUBLIC_SITE_URL` with deployed URLs in production.

## Content and admin

- Edit fallback profile content in `src/data/profile.json`, or manage database-backed content through `/admin` after signing in at `/admin/login`.
- To seed an admin account and initial content, set `MONGODB_URI`, `PASS_SEC`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD`, then run `npm run seed`. The script replaces all project records and overwrites the primary portfolio content; use it only when that reset is intended.
- The chatbot widget and visit counter are separate services. Set their public URLs in `.env.local` when running them locally or in the Vercel project when deployed.

## Checks and deployment

Run `npm run lint` and `npm run build` from this directory. The GitHub Actions workflows deploy portfolio changes to the configured Vercel project; set the required environment values in Vercel as well as locally.
