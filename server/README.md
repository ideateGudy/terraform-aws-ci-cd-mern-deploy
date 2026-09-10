# Express Server Backend

Node.js Express backend API providing authentication, URL shortener, and diary management routes.

## 🚀 Running Locally

```bash
npm install
npm run dev
```

## 🐳 Docker Container

Built using `server/Dockerfile`:
```bash
docker build -t diary-server .
docker run -p 3000:3000 --env-file .env diary-server
```

## 🔑 Environment Variables

See `.env.example` in the server folder or project root for required variables (`MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`).
