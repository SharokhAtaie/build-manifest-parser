# Next.js Build Manifest Parser

A small React + Vite + Tailwind tool to parse Next.js `_buildManifest.js` and list routes/files.

## Local Development
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Deploy to GitHub Pages
This repo is configured for GitHub Pages with Actions.

Steps:
1. Push the project to a GitHub repository (public or private with Pages).
2. In GitHub, go to Settings → Pages → Build and deployment:
   - Source: GitHub Actions
3. Ensure your default branch is `main` (or update the workflow to match).
4. Push to `main`. The workflow `.github/workflows/deploy.yml` will build and deploy `dist`.

Notes:
- The Vite `base` is set dynamically to `/<repo>/` on GitHub Actions so assets resolve under the Pages subpath.
- If your repo name changes or you deploy elsewhere, no code changes are needed; the workflow sets `GITHUB_REPOSITORY` automatically. 