# Important Commands

Day-to-day commands for AasPass. Examples use **PowerShell** (Windows); on macOS/Linux use `./mvnw` instead of `.\mvnw.cmd`.

## Frontend (`aaspass-client`)

Run these from the `aaspass-client` folder.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first run, or after `package.json` changes). |
| `npm start` | Start the dev server on <http://localhost:4200>. `/api` is proxied to the backend on `http://localhost:8080` (`proxy.conf.json`). |
| `npm run start:clean` | Clear the Angular/Vite cache, then start the dev server. Use it when the app behaves oddly in dev (see [Troubleshooting](#troubleshooting)). |
| `npm run build` | Production build into `dist/aaspass-client`; also the compile check required before finishing a change. |
| `npm test -- --watch=false` | Run all unit tests once (Vitest). |
| `npx ng test --watch=false --include src/app/pages/stores/stores.spec.ts` | Run one spec file. |
| `npm run build:geo` | Regenerate the country/city lists in `public/geo` (only when updating geo data). |

### Angular cache

| Command | What it does |
|---|---|
| `npx ng cache clean` | Delete the build cache (`.angular/cache`). Stop the dev server first. |
| `npx ng cache info` | Show where the cache lives and whether it is enabled. |
| `npx ng cache disable` / `npx ng cache enable` | Turn the cache off/on. Off avoids stale caches but makes every serve/build slower. |
| `Remove-Item -Recurse -Force .angular\cache` | Manual fallback if `ng cache clean` fails. |

## Admin (`aaspass-admin`)

A separate Angular workspace with its own `.angular/cache`, so it can run beside the client dev server. Run these from the `aaspass-admin` folder.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies (first run, or after `package.json` changes). |
| `npm start` | Start the dev server on <http://localhost:4300>. `/api` is proxied to the backend on `http://localhost:8080` (`proxy.conf.json`). Runs `copy:geo` first. |
| `npm run build` | Production build into `dist/aaspass-admin`; also the compile check required before finishing a change. |
| `npm test -- --watch=false` | Run all unit tests once (Vitest). |
| `npm run copy:geo` | Copy `countries.generated.ts` and `public/geo` from `aaspass-client` (both git-ignored). Runs automatically before start, build and test. |

## Backend (`aaspass-service-backend`)

Run these from the `aaspass-service-backend` folder. MySQL must be running on port `3306`.

| Command | What it does |
|---|---|
| `.\mvnw.cmd spring-boot:run` | Start the API on <http://localhost:8080> (`dev` profile by default). |
| `.\mvnw.cmd test-compile` | Compile main and test code; the compile check required before finishing a change. |
| `.\mvnw.cmd test` | Run the backend tests. |

## Troubleshooting

### Blank page (only navbar and footer) or 504/404 on `/@fs/.../vite/deps/*.js`

The dev server's cache is stale. In dev, Vite serves each library as its own file from `.angular/cache`; when that cache is rebuilt (by another dev server, or after `npm install`), an open page asks for files that no longer exist and lazy pages such as `/stores` render blank. The `/@fs/...` requests themselves are normal in dev; they are not API calls.

1. Stop every running `npm start` / `ng serve`.
2. Run `npm run start:clean` (or `npx ng cache clean`, then `npm start`).
3. Hard-refresh the browser with **Ctrl+Shift+R**.

To avoid it, run **one** dev server per project at a time (all of them share `.angular/cache`), and hard-refresh after `npm install` or an Angular upgrade.

### Port already in use

| Command | What it does |
|---|---|
| `Get-NetTCPConnection -LocalPort 4200 -State Listen \| Select-Object OwningProcess` | Find the process holding a port (use `8080` for the backend). |
| `Stop-Process -Id <pid>` | Stop that process. |
| `npm start -- --port 4300` | Start the dev server on another port instead. |
