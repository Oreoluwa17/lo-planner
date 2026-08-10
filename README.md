# L & O Wedding Planner

## Setup

### 1 — Create Next.js project
```bash
npx create-next-app@latest lo-planner
cd lo-planner
```
TypeScript → No, ESLint → Yes, Tailwind → Yes, src/ → No, App Router → Yes, alias → No

### 2 — Install next-auth
```bash
npm install next-auth
```

### 3 — Copy all files from this zip into your project (replace defaults)

### 4 — Set up Google Sheets
1. Create a new Google Sheet
2. Extensions → Apps Script → paste `apps-script-planner.js`
3. Run `initSheets` once to create all tabs + load default tasks
4. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone)
5. Copy the deployment URL

### 5 — Push to GitHub and connect to Vercel

### 6 — Add Environment Variables in Vercel
| Key | Value |
|-----|-------|
| `SHEETS_SCRIPT_URL` | Your Apps Script deployment URL |
| `NEXTAUTH_SECRET` | Any long random string |
| `NEXTAUTH_URL` | Your Vercel URL e.g. https://lo-planner.vercel.app |
| `PASSWORD_OREOLUWA` | Password for Oreoluwa |
| `PASSWORD_LONDIWE` | Password for Londiwe |

### 7 — Redeploy and login
| Username | Password |
|----------|----------|
| `ore` | your PASSWORD_OREOLUWA value |
| `londiwe` | your PASSWORD_LONDIWE value |
