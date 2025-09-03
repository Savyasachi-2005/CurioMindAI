# CurioMindAI Frontend

React + Vite + Tailwind single-page app with a loading screen and a playful landing page.

- Loading page shows animated title then redirects to `/home`.
- Landing page calls `/explain` and can export notes via `/notes/pdf`.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run preview` - preview production build

## API base configuration

- In development, the app uses Vite proxy (see `vite.config.ts`) and can call `/explain`, `/notes`, `/export` directly.
- In production, set an environment variable `VITE_API_URL` to your backend base URL, e.g.:

```
VITE_API_URL=https://curiomind-backend.onrender.com
```

The app will prefix API calls with this base. See `.env.example`.

## Environment

The dev server proxies API calls to `http://localhost:8000` for `/explain` and `/notes/pdf`. Adjust `vite.config.ts` if your backend runs elsewhere.
