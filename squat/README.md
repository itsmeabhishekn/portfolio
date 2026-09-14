# Squat

Isolated fitness tracking frontend. It does not share code, styles, or routing with the portfolio or htracker.

## Local development

Sign-in, the dashboard, workout templates, and the active session talk to the NestJS API. History, progress, programs, and the exercise catalog still read local mock data because no endpoints exist for them yet.

Copy `.env.example` to `.env`. Both values are required, and the build fails without them:

```text
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Terminal 1:

```bash
cd squat-api
docker compose up -d
npx prisma migrate dev
npm run start:dev
```

Terminal 2:

```bash
cd squat
npm run squat:dev
```

Open `http://localhost:5173/squat/` and sign in with Google. There is no seed: your first sign-in creates your user and a starter program.

## Google OAuth client

One OAuth 2.0 **Web application** client in Google Cloud Console, with `http://localhost:5173` and the deployed origin listed under **Authorized JavaScript origins**. No redirect URI is needed, because Google Identity Services returns the ID token to the page rather than redirecting.

Only the client ID is used. The client secret is not part of this flow and must never be added to the frontend.

## Production build

The build bakes `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` into the bundle, so set them in `squat/.env.production` or the build environment. The output is copied to `out/squat/` after the Next.js export so `/squat/` is served from the same site.

The API must be reachable over HTTPS from the deployed origin. A browser on an `https://` page will not call an `http://` API.
