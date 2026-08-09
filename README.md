# L & O Wedding Planner

Private wedding planning app for Londiwe & Oreoluwa.
Two-user login, Google Sheets backend, mobile-friendly.

---

## Quick Setup

### 1 — Create a new Next.js project

```bash
npx create-next-app@latest lo-planner
cd lo-planner
```
When prompted: TypeScript → No, ESLint → Yes, Tailwind → Yes, src/ → No, App Router → Yes, alias → No

### 2 — Install dependencies

```bash
npm install next-auth
```

### 3 — Copy all files from this folder into your project

Replace the default files with everything from this zip.

### 4 — Set up Google Sheets

1. Create a new Google Sheet at sheets.google.com
2. Go to **Extensions → Apps Script**
3. Delete the default code and paste the contents of `apps-script-planner.js`
4. Click **Save**
5. Run the `initSheets` function once (click ▶ Run with `initSheets` selected in the dropdown)
   - This creates all 4 tabs (Vendors, Tasks, Budget, Activity) and loads all default tasks
6. Go to **Deploy → New deployment**
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
7. Click **Deploy**, authorize when prompted
8. **Copy the deployment URL** — you'll need it in Step 6

### 5 — Set up Vercel

1. Push your project to a new GitHub repo
2. Go to vercel.com → New Project → Import the repo
3. Click **Deploy**

### 6 — Add Environment Variables in Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| `SHEETS_SCRIPT_URL` | Your Apps Script deployment URL |
| `NEXTAUTH_SECRET` | Any random string (e.g. run `openssl rand -base64 32` or just type a long random string) |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://lo-planner.vercel.app`) |
| `PASSWORD_OREOLUWA` | Choose a password for Oreoluwa |
| `PASSWORD_LONDIWE` | Choose a password for Londiwe |

After adding all variables, go to **Deployments → Redeploy**.

### 7 — Login

Visit your Vercel URL. You'll see the login screen.

| Username | Password |
|----------|----------|
| `ore` | whatever you set for `PASSWORD_OREOLUWA` |
| `londiwe` | whatever you set for `PASSWORD_LONDIWE` |

---

## How it works

- **Google Sheets** is the database (4 tabs: Vendors, Tasks, Budget, Activity)
- **Apps Script** is the API — all reads/writes go through it
- **Next.js API routes** proxy calls to Apps Script (so the URL stays private)
- **NextAuth** handles login — sessions stored as JWTs
- Every action is logged automatically with who did it and when

---

## Updating content later

For code changes (new features, UI tweaks):
```bash
git add .
git commit -m "update"
git push
```
Vercel auto-deploys in ~30 seconds.

If you update the Apps Script:
**Deploy → Manage deployments → ✏️ Edit → New version → Deploy**

---

## Pages

| Page | URL | What it does |
|------|-----|-------------|
| Dashboard | `/dashboard` | Overview — countdown, stats, recent activity |
| Vendors | `/vendors` | Add/edit/delete vendors with status tracking |
| Tasks | `/tasks` | 58 pre-loaded tasks, tick off as you go |
| Budget | `/budget` | Set budget, track quotes vs paid |
| Activity | `/activity` | Full log of who did what and when |
