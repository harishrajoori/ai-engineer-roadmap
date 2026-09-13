# Studio cloud sync (Cloudflare Worker)

Optional backend for **Sign in with Google** + cross-device progress, notes, API keys, and AI regenerations.

## Deploy

1. Create a KV namespace and Worker in Cloudflare.
2. Bind `STUDIO_KV` to this worker.
3. Deploy `worker.js` (Wrangler or dashboard paste).
4. Set `VITE_STUDIO_SYNC_URL` to the worker URL when building the React app (GitHub Actions secret or `.env`).

## API

- `GET ?userId=<google-sub>` → JSON `{ updatedAt, state, regenerations? }`
- `POST` body `{ userId, state, updatedAt }` → stores if incoming `updatedAt` is newer

**Security:** This sample trusts `userId` from the client. For production, verify the Google ID token in the worker before read/write.
