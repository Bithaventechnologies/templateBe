# Email Studio API

Express + Node.js + Prisma + Neon (Postgres) backend for the Email Studio dashboard.

## Setup

```bash
npm install
cp .env.example .env        # then fill in the values
npx prisma migrate dev --name init
npm run db:seed             # adds the 6 starter templates
npm run dev
```

The API runs on http://localhost:5000. Check http://localhost:5000/health.

### Neon connection strings

In the Neon dashboard, open your project and click **Connect**.

- `DATABASE_URL` is the **pooled** string (the host contains `-pooler`). The app uses this one.
- `DIRECT_URL` is the **direct** string (no `-pooler`). Prisma migrations use this one.

Both should end with `?sslmode=require`.

### Email (Resend)

Set `RESEND_API_KEY` and `MAIL_FROM` in `.env`. `MAIL_FROM` must be a sender address verified in Resend. SMTP settings are no longer used.

## How login works

There is one owner. `POST /api/auth/login` with `{ "password": "<ADMIN_PASSWORD>" }` returns a token.
Send it on every other request as `Authorization: Bearer <token>`.

## Endpoints

All routes below start with `/api` and need the token, except login.

| Method | Route | What it does |
|---|---|---|
| POST | `/auth/login` | Log in, returns `{ token }` |
| GET | `/auth/me` | Check the token is still valid |
| GET | `/templates` | List templates (`?category=` and `?active=true` optional) |
| GET | `/templates/:idOrSlug` | Get one template |
| POST | `/templates` | Create a template |
| PUT | `/templates/:id` | Update a template |
| DELETE | `/templates/:id` | Delete a template |
| GET | `/emails/templates` | List six built-in templates and editable fields |
| POST | `/emails/preview` | Render a template without sending |
| POST | `/emails/send` | Send an email and save it to history |
| GET | `/emails` | History (`?page=`, `?limit=`, `?status=SENT\|FAILED`, `?search=`) |
| GET | `/emails/stats` | Totals: `{ total, sent, failed }` |
| GET | `/emails/:id` | One sent email, including its HTML |
| DELETE | `/emails/:id` | Delete from history |
| GET | `/settings` | Business name, sender name, reply-to |
| PUT | `/settings` | Update those details |

### Preview or send an email

Built-in template IDs are `welcome`, `business`, `congratulations`, `promotional`, `announcement`, and `custom`. They require `name`, `companyName`, and `message` values. Preview accepts `templateId`, optional `subject`, and `values`; send accepts the same plus `to`.

```json
{
  "templateId": "welcome",
  "subject": "Welcome to {{companyName}}",
  "values": { "name": "Amaka", "companyName": "Acme", "message": "Thanks for joining us." }
}
```

`POST /api/emails/preview` returns rendered subject and HTML without sending. `POST /api/emails/send` sends with Resend and returns its message ID. Sending is limited to 20 requests per minute.

### Run locally

Copy `.env.example` to `.env`, fill in `DATABASE_URL`, `DIRECT_URL`, `ADMIN_PASSWORD`, `JWT_SECRET`, `RESEND_API_KEY`, and `MAIL_FROM`, then run `npm install`, `npx prisma migrate dev`, `npm run db:seed`, and `npm run dev`. Log in at `POST /api/auth/login` and pass the returned token as a bearer token.

## Project structure

```
prisma/
  schema.prisma     Template, Email, Settings
  seed.js           the 6 starter templates
src/
  server.js         starts the server
  app.js            cors, json, routes, errors
  config/env.js     reads and checks .env
  routes/           one file per resource
  controllers/      the logic for each route
  middleware/       auth, validation, error handling
  lib/              prisma client, mailer, helpers
```

## Deploying

Run `npx prisma migrate deploy` once against your production database, then `npm start`.
Set `CLIENT_URL` to your live frontend address (several are allowed, separated by commas).
