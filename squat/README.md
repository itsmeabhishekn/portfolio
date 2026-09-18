# Squat

Isolated fitness tracking frontend. It does not share code, styles, or routing with the portfolio or htracker.

## Local development

Sign-in, the upcoming workout, templates, the active session, and the exercise catalog talk to the NestJS API. History, progress, and programs still render empty states.

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

Open `http://localhost:5173/squat/` and sign in with Google. First sign-in creates your user only. Load a program from `squat-api`:

```bash
cd squat-api
npm run program:import -- --email you@example.com
```

## Google OAuth client

One OAuth 2.0 **Web application** client in Google Cloud Console. **Authorized JavaScript origins** must include exactly:

```text
https://abhishekn.dev
https://www.abhishekn.dev
http://localhost:5173
http://localhost:3000
```

Do not add a path (`/squat`). Do not add the API host. Do not add a LAN IP such as `http://192.168.x.x` — Google rejects those, which is why sign-in from a phone on local Wi‑Fi fails even when a laptop on `localhost` works.

No redirect URI is needed, because Google Identity Services returns the ID token to the page rather than redirecting.

Only the client ID is used. The client secret is not part of this flow and must never be added to the frontend.

## Production build

The build bakes `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` into the bundle, so set them in `squat/.env.production` or the build environment. The output is copied to `out/squat/` after the Next.js export so `/squat/` is served from the same site.

The API must be reachable over HTTPS from the deployed origin. A browser on an `https://` page will not call an `http://` API.
