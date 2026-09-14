# Squat

Isolated fitness tracking frontend. It does not share code, styles, or routing with the portfolio or htracker.

## Local development

The Dashboard → workout template → start/resume flow talks to the NestJS API. History, progress, programs, and auth screens still use mock data.

Copy `.env.example` to `.env`. The API base URL must match the backend port (`3001` by default):

```text
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

Terminal 1:

```bash
cd squat-api
docker compose up -d
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

Terminal 2:

```bash
cd squat
npm run squat:dev
```

Open `http://localhost:5173/squat/`.

The production build is copied to `out/squat/` after the Next.js export so `/squat/` is served from the same site.
