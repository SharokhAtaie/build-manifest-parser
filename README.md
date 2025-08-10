## Next.js Build Manifest Parser

A sleek React + Vite + Tailwind web app to parse Next.js `_buildManifest.js`, list all discovered routes, and copy related JS/CSS assets.

- **Live demo**: [Build Manifest Parser](https://sharokhataie.github.io/build-manifest-parser/)
- **Deploy status**: ![Deploy](https://github.com/SharokhAtaie/build-manifest-parser/actions/workflows/deploy.yml/badge.svg)

### Screenshot

<img width="1609" height="979" alt="Screenshot 2025-08-11 at 01 23 25" src="https://github.com/user-attachments/assets/c32fee70-cddf-4148-8493-85ae69996e6b" />

### Features
- **Paste or fetch**: Paste manifest content or fetch a `_buildManifest.js` URL directly
- **Routes overview**: Lists all discovered routes from the manifest
- **Filter**: Quickly filter routes by substring
- **Copy actions**: Copy all routes, or all `.js` / `.css` asset paths
- **Modern UI**: Gradient buttons, glass panels, dark theme

### How it works
- Next.js generates `_buildManifest.js` that assigns to `self.__BUILD_MANIFEST`.
- The app evaluates the manifest code within a Web Worker, shadowing `self` (sandbox), and reads the resulting object.

### Usage
1) Paste a `_buildManifest.js` URL and click “Fetch & Parse”
   - Note: Cross-origin requests may be blocked by CORS. If it fails, download or copy the file and paste its content.
2) Or paste the file content directly and click “Parse Content”.
3) Use Filter and Copy actions as needed.

### Local development
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

### Tech stack
- React + TypeScript
- Vite
- Tailwind CSS

### Notes on security
- Manifest code is evaluated inside a Web Worker and provided a sandboxed `self` object to reduce risk. Never paste untrusted code from unknown sources.

---
Built by [Sharokh](https://github.com/sharokhAtaie) 