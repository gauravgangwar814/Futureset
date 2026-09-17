# FutureSet - E-Learning & Affiliate Platform

FutureSet is a modern full-stack e-learning and affiliate management platform built with React, Vite, Tailwind CSS, and Express.

---

## 🚀 Quick Start (Run Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
The application will start at `http://localhost:3000`.

### 3. Build & Run for Production
```bash
npm run build
npm start
```

---

## 📦 How to Push / Export to GitHub

### Option A: Direct Export from Google AI Studio (Easiest)
1. In Google AI Studio Build, click on the **Settings / More Options (⋮)** menu at the top right.
2. Select **Export to GitHub** (or **Download ZIP** to push manually).
3. Connect your GitHub account and choose your repository name.

### Option B: Push Manually via Git
```bash
git init
git add .
git commit -m "Initial commit - FutureSet platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

---

## 🌐 Deploying Live from GitHub

> ⚠️ **Important Note regarding GitHub Pages:**
> GitHub Pages is designed exclusively for static websites (HTML/CSS/JS). Because FutureSet includes an Express backend (`server.ts`), file database (`database.json`), and API endpoints (`/api/...`), deploying to pure GitHub Pages will not run the server APIs.
>
> **Recommended Free/Simple Hosting connected directly to your GitHub Repository:**

### Deploy on Render (Recommended - Free & Easy):
1. Create a free account at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings carefully:
   - **Environment:** Node
   - **Root Directory:** Leave **EMPTY / BLANK** (do NOT enter `src`)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Click **Deploy Web Service**! Render will provide you a free live URL (e.g. `futureset.onrender.com`) that automatically updates whenever you push changes to GitHub.

#### 💡 Render Deployment Troubleshooting:
- **Error: `Failed to resolve /src/main.tsx from index.html`**:
  - Check the **Root Directory** field in Render settings — it must be completely **BLANK** (empty).
  - Ensure all files in your GitHub repository are in the root directory (i.e. `index.html`, `package.json`, and the `src` folder are all visible on the repository home page, not nested inside another folder).

### Alternative Platforms:
- **Railway.app:** Connect GitHub repo -> auto-detects Node.js build & start scripts.
- **Google Cloud Run:** Deploy containerized or directly via Cloud Build connected to GitHub.
