# Vercel + Render Deployment Guide

This guide explains how to deploy the `client` frontend to Vercel and the `server` backend to Render, with a shared MongoDB Atlas database and Anthropic Claude AI integration.

## Overview

- `client/` is a Vite React app.
- `server/` is an Express API with Socket.io and Anthropic Claude integration.
- The frontend uses `VITE_API_URL` to connect to the backend.
- The backend uses `CLIENT_URL` to allow CORS from the deployed frontend.

---

## 1. Deploy Frontend to Vercel

### Step 1: Create a new Vercel project

1. Go to https://vercel.com and sign in.
2. Click **New Project** and import this repository.
3. Under **Root Directory**, set: `client`
4. Framework preset should detect **Vite** automatically.

### Step 2: Configure build settings

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

### Step 3: Add environment variables

Add the following variable in Vercel project settings:

- `VITE_API_URL` = `https://<your-render-service>.onrender.com`

> Example: `https://volunteersync-api.onrender.app`

### Step 4: Deploy

1. Save the settings.
2. Deploy the Vercel project.
3. Confirm that the site loads and the frontend can reach the backend URL.

---

## 2. Deploy Backend to Render

### Step 1: Create a new Render Web Service

1. Go to https://render.com and log in.
2. Click **New** → **Web Service**.
3. Connect your repository and choose the correct branch.
4. Set **Root Directory** to: `server`
5. Choose **Environment**: `Node`.

### Step 2: Configure build and start commands

- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: `Free` or as needed

Render automatically provides the `PORT` environment variable, and the server uses it in `server/index.js`.

### Step 3: Add environment variables

Add at least these values in Render:

- `MONGO_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = a strong secret for JWT signing
- `ANTHROPIC_API_KEY` = your Claude API key
- `CLIENT_URL` = `https://<your-vercel-domain>.vercel.app`

> Example: `https://volunteersync.vercel.app`

If you want to allow multiple origins, use a comma-separated list:

- `CLIENT_URL` = `https://volunteersync.vercel.app,https://another-domain.vercel.app`

### Step 4: Deploy

1. Save the settings.
2. Deploy the Render service.
3. Verify the backend health endpoint at `https://<your-render-service>.onrender.app/api/health`.

---

## 3. CORS and API connectivity

The backend reads `CLIENT_URL` and `CLIENT_URL` must include the deployed frontend origin.

The frontend uses `VITE_API_URL` in `client/src/api/axios.js`:

```js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

That means the frontend will call:

```text
https://<your-render-service>.onrender.app/api
```

If the backend returns CORS errors, confirm:

- `CLIENT_URL` includes the Vercel domain
- `VITE_API_URL` points to the Render backend URL
- The backend deploy is healthy and running

---

## 4. Local environment preview

For local development, create a `.env` file in the repository root or `server/` folder with these values:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=supersecretvalue
ANTHROPIC_API_KEY=xxx
CLIENT_URL=http://localhost:5173
```

For the frontend, create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

Then run locally:

```bash
cd server
npm run dev

cd ../client
npm run dev
```

---

## 5. Troubleshooting

- If the frontend cannot reach the backend, check the Vercel `VITE_API_URL` value.
- If the backend rejects requests, confirm `CLIENT_URL` matches the Vercel origin.
- If the backend fails on startup, inspect Render logs for missing env variables or MongoDB connection issues.
- Confirm the backend health endpoint works before testing the frontend.

---

## 6. Optional improvements

- Add a `vercel.json` file to pin Vercel settings if needed.
- Use Render’s `Auto Deploy` option for continuous deployment on pushes.
- Add a dedicated `CLIENT_URL`-only CORS allow list if you want multiple frontend destinations.
