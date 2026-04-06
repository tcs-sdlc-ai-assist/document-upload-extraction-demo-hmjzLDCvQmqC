# DEPLOYMENT.md

# Deployment Guide

This document covers deploying the **Doc Upload Extraction** app to Vercel and configuring the environment for production.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Build Configuration](#build-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [SPA Routing Configuration](#spa-routing-configuration)
6. [CI/CD with GitHub Actions](#cicd-with-github-actions)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js **18.x** or later
- npm **9.x** or later
- A [Vercel](https://vercel.com) account
- The repository hosted on GitHub, GitLab, or Bitbucket

---

## Environment Variables

The application uses Vite environment variables prefixed with `VITE_`. These must be set in your deployment environment.

| Variable               | Required | Default                  | Description                                      |
|------------------------|----------|--------------------------|--------------------------------------------------|
| `VITE_APP_NAME`        | No       | `Doc Upload Extraction`  | Application name displayed in the UI            |
| `VITE_MAX_FILE_SIZE_MB`| No       | `10`                     | Maximum file upload size in megabytes            |

> **Important:** All environment variables consumed by the frontend **must** be prefixed with `VITE_`. Variables without this prefix are not exposed to the browser bundle by Vite.

### Setting Environment Variables Locally

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_APP_NAME=Doc Upload Extraction
VITE_MAX_FILE_SIZE_MB=10
```

### Setting Environment Variables on Vercel

1. Open your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings → Environment Variables**.
3. Add each variable with its corresponding value.
4. Select the target environments: **Production**, **Preview**, and/or **Development**.
5. Click **Save** and redeploy for changes to take effect.

---

## Build Configuration

### Build Command

```bash
npm run build
```

This runs `tsc --noEmit` (type checking) followed by `vite build` to produce an optimized production bundle.

### Output Directory

```
dist/
```

Vite outputs the compiled, minified static assets to the `dist/` directory. This is the directory Vercel (and other static hosts) should serve.

### Preview Build Locally

To preview the production build locally before deploying:

```bash
npm run build
npm run preview
```

The preview server starts at `http://localhost:4173` by default.

---

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect your repository:**
   - Go to [vercel.com/new](https://vercel.com/new).
   - Import your GitHub/GitLab/Bitbucket repository.

2. **Framework auto-detection:**
   - Vercel automatically detects **Vite** as the framework.
   - The following settings are pre-configured:
     - **Framework Preset:** Vite
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`

3. **Set environment variables:**
   - Expand the **Environment Variables** section during project setup.
   - Add `VITE_APP_NAME` and `VITE_MAX_FILE_SIZE_MB` as needed.

4. **Deploy:**
   - Click **Deploy**.
   - Vercel builds and deploys the app. A production URL is assigned (e.g., `https://your-project.vercel.app`).

### Option 2: Deploy via Vercel CLI

Install the Vercel CLI:

```bash
npm install -g vercel
```

Authenticate:

```bash
vercel login
```

Deploy from the project root:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

---

## SPA Routing Configuration

This project is a **Single Page Application (SPA)** using React Router. All routes are handled client-side, so the server must return `index.html` for every path — otherwise a direct URL visit (e.g., `/dashboard`) returns a 404.

The `vercel.json` file at the project root configures this rewrite rule:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**How it works:**

- Any request path (e.g., `/login`, `/upload`, `/history`) is rewritten to serve `/index.html`.
- React Router then reads `window.location` and renders the correct component for that route.
- Static assets (JS, CSS, images) are still served correctly because Vercel resolves them before applying rewrites.

> This file is already committed to the repository and requires no manual configuration.

---

## CI/CD with GitHub Actions

You can automate deployments using GitHub Actions with the official Vercel Action.

### Example Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --run

      - name: Type check
        run: npx tsc --noEmit

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Required GitHub Secrets

Add these secrets in **GitHub → Settings → Secrets and variables → Actions**:

| Secret               | How to obtain                                                                 |
|----------------------|-------------------------------------------------------------------------------|
| `VERCEL_TOKEN`       | Vercel Dashboard → Account Settings → Tokens → Create Token                  |
| `VERCEL_ORG_ID`      | Found in `.vercel/project.json` after running `vercel link` locally           |
| `VERCEL_PROJECT_ID`  | Found in `.vercel/project.json` after running `vercel link` locally           |

### Automatic Preview Deployments

Vercel automatically creates **Preview Deployments** for every pull request when the repository is connected via the Vercel Dashboard. No additional configuration is required.

---

## Troubleshooting

### Build fails with TypeScript errors

Run type checking locally to identify issues:

```bash
npx tsc --noEmit
```

Fix all reported type errors before pushing.

### Routes return 404 on direct navigation

Ensure `vercel.json` is present at the project root with the SPA rewrite rule. See [SPA Routing Configuration](#spa-routing-configuration).

### Environment variables are undefined at runtime

- Confirm all variable names start with `VITE_`.
- Verify the variables are set in the Vercel Dashboard under **Settings → Environment Variables**.
- Trigger a new deployment after adding or changing environment variables — existing deployments do not pick up changes automatically.

### PDF extraction fails in production

The app uses `pdfjs-dist` for PDF text extraction. Ensure the worker file is accessible. The `documentExtractor.ts` service configures the worker path — no additional setup is required for Vite builds.

### Large file uploads are slow

The default maximum file size is **10 MB**, controlled by `VITE_MAX_FILE_SIZE_MB`. All processing happens client-side in the browser; no server upload occurs. Adjust the limit in your environment variables if needed.

---

## Summary

| Setting              | Value                        |
|----------------------|------------------------------|
| Framework            | Vite                         |
| Build Command        | `npm run build`              |
| Output Directory     | `dist/`                      |
| Node.js Version      | 18.x or later                |
| Routing              | SPA (client-side via vercel.json rewrite) |
| Environment Variables| `VITE_APP_NAME`, `VITE_MAX_FILE_SIZE_MB` |