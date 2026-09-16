# TEDxPCU Website

> Official website for **TEDxPCU** — featuring dynamic talks, inspiring speakers, and opportunities for deep discussion and collaboration.

Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **GSAP**, **Framer Motion**, **Lenis** smooth scroll, and **tsParticles**.

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your machine:

| Tool       | Required Version | Download Link                                                     |
| ---------- | ---------------- | ----------------------------------------------------------------- |
| **Node.js** | v22 or higher    | [https://nodejs.org/](https://nodejs.org/)                        |
| **pnpm**   | v10.34+          | [https://pnpm.io/installation](https://pnpm.io/installation)     |
| **Git**    | Latest           | [https://git-scm.com/downloads](https://git-scm.com/downloads)   |

### Installing Node.js

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the **v22 LTS** installer for your OS (Windows / macOS / Linux)
3. Run the installer and follow the prompts
4. Verify installation:
   ```bash
   node --version
   # Should output v22.x.x or higher
   ```

### Installing pnpm

After Node.js is installed, run:

```bash
npm install -g pnpm@10.34.3
```

Verify:

```bash
pnpm --version
# Should output 10.34.3
```

---

## 🚀 Quick Start (Full Setup in 4 Commands)

```bash
# 1. Clone the repository
git clone <your-repo-url> TEDxPCU_Website

# 2. Navigate into the project folder
cd TEDxPCU_Website

# 3. Install all dependencies
pnpm install

# 4. Start the development server
pnpm dev
```

The site will be live at **http://localhost:8443**

---

## 📦 Dependency Breakdown

### Runtime Dependencies

These are the libraries the website uses at runtime:

| Package               | Version  | Purpose                                           | Install Command                        |
| --------------------- | -------- | ------------------------------------------------- | -------------------------------------- |
| `react`               | ^19.0.0  | Core UI library                                   | `pnpm add react`                       |
| `react-dom`           | ^19.0.0  | React DOM renderer                                | `pnpm add react-dom`                   |
| `framer-motion`       | ^13.1.1  | Declarative animations and transitions            | `pnpm add framer-motion`               |
| `gsap`                | ^3.15.0  | High-performance animations (scroll, timeline)    | `pnpm add gsap`                        |
| `lenis`               | ^1.3.26  | Smooth scroll experience                          | `pnpm add lenis`                       |
| `@tsparticles/react`  | ^4.4.0   | React component for particle effects              | `pnpm add @tsparticles/react`          |
| `@tsparticles/slim`   | ^4.4.0   | Lightweight particle engine bundle                | `pnpm add @tsparticles/slim`           |

### Dev Dependencies

These are used only during development and build:

| Package                 | Version  | Purpose                                      | Install Command                               |
| ----------------------- | -------- | -------------------------------------------- | --------------------------------------------- |
| `vite`                  | ^8.0.5   | Lightning-fast build tool and dev server      | `pnpm add -D vite`                            |
| `@vitejs/plugin-react`  | ^6.0.0   | Vite plugin for React (JSX, Fast Refresh)     | `pnpm add -D @vitejs/plugin-react`            |
| `typescript`            | ^5.7.0   | TypeScript compiler                           | `pnpm add -D typescript`                      |
| `tailwindcss`           | ^4.0.0   | Utility-first CSS framework (v4)              | `pnpm add -D tailwindcss`                     |
| `@tailwindcss/vite`     | ^4.0.0   | Tailwind CSS v4 Vite integration plugin       | `pnpm add -D @tailwindcss/vite`               |
| `@types/react`          | ^19.0.0  | TypeScript type definitions for React         | `pnpm add -D @types/react`                    |
| `@types/react-dom`      | ^19.0.0  | TypeScript type definitions for React DOM     | `pnpm add -D @types/react-dom`                |
| `@types/node`           | ^22.0.0  | TypeScript type definitions for Node.js       | `pnpm add -D @types/node`                     |
| `oxfmt`                 | ^0.2.0   | Code formatter                                | `pnpm add -D oxfmt`                           |

> **Note:** You do NOT need to install these individually. Running `pnpm install` handles everything.

---

## 🏗️ Project Structure

```
TEDxPCU_Website/
├── index.html              # HTML entry point (Vite shell)
├── package.json            # Dependencies and scripts
├── pnpm-lock.yaml          # Locked dependency versions
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── tsconfig.json           # TypeScript compiler configuration
├── vite.config.ts          # Vite build configuration
├── .figma/                 # Figma Make configuration (can be ignored)
│   └── make/
│       └── site.json       # Site metadata (title, description, icons)
├── public/                 # Static assets served as-is
│   └── tab_logo.jpeg       # Favicon / tab icon
└── src/                    # Source code
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main application component
    ├── index.css           # Global CSS + Tailwind v4 import
    ├── vite-env.d.ts       # Vite type declarations
    ├── components/         # Reusable UI components
    │   ├── ChromaGrid.tsx / .css
    │   ├── DepthCarousel.tsx / .css
    │   ├── MagicBento.tsx / .css
    │   ├── PixelCard.tsx / .css
    │   ├── TicketCard.tsx
    │   ├── TiltedCard.tsx / .css
    │   └── TitleReveal.tsx / .css
    ├── imports/             # Image assets
    │   ├── Speakers/       # Speaker photos
    │   ├── Sponsors/       # Sponsor logos
    │   ├── Team/           # Team member photos
    │   └── Theme/          # Theme / branding images
    └── pages/              # Page-level components
        ├── AboutPage.tsx
        └── TeamsPage.tsx
```

---

## 🔧 Available Scripts

| Command          | Description                                           |
| ---------------- | ----------------------------------------------------- |
| `pnpm dev`       | Start the development server at `http://localhost:8443` |
| `pnpm build`     | Create an optimized production build in `dist/`       |
| `pnpm preview`   | Preview the production build locally                  |
| `pnpm format`    | Format code using oxfmt                               |

---

## 🌐 Deploying to Production

### Option 1: Static Hosting (Recommended)

This is a **static site** — after building, you get plain HTML/CSS/JS files that can be hosted anywhere.

```bash
# Build the project
pnpm build
```

This creates a `dist/` folder. Upload the **contents** of `dist/` to your hosting provider.

#### Popular static hosts:

- **Vercel**: Connect your GitHub repo → auto-deploys on push
- **Netlify**: Drag-and-drop the `dist/` folder, or connect GitHub
- **GitHub Pages**: Push `dist/` contents to a `gh-pages` branch
- **Apache / Nginx**: Copy `dist/` to your web server's root directory
- **College Domain (cPanel / shared hosting)**: Upload `dist/` contents via File Manager or FTP

### Option 2: Deploy on Vercel (Easiest)

1. Push the code to a GitHub repository
2. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"New Project"** → Import your repo
4. Set the following build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
5. Click **Deploy**

### Option 3: Deploy on Netlify

1. Push the code to GitHub
2. Go to [https://netlify.com](https://netlify.com)
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect your GitHub repo
5. Build settings:
   - **Build Command**: `pnpm build`
   - **Publish Directory**: `dist`
6. Click **Deploy**

### Option 4: Traditional Server (Apache / Nginx / cPanel)

```bash
# Build locally
pnpm build

# Upload the dist/ folder to your server
# For example, using SCP:
scp -r dist/* user@your-server:/var/www/html/

# Or using FTP/SFTP via FileZilla, upload dist/* to public_html/
```

> **Important for SPA routing:** If you use client-side routing, add a redirect rule so all paths serve `index.html`. For Apache, create a `.htaccess` file inside `dist/`:
>
> ```apache
> <IfModule mod_rewrite.c>
>   RewriteEngine On
>   RewriteBase /
>   RewriteRule ^index\.html$ - [L]
>   RewriteCond %{REQUEST_FILENAME} !-f
>   RewriteCond %{REQUEST_FILENAME} !-d
>   RewriteRule . /index.html [L]
> </IfModule>
> ```

---

## ⚠️ Important Notes

### Figma Make Configuration

This project was originally built inside **Figma Make**. The `vite.config.ts` imports from `.figma/make/site.json` and includes Figma-specific plugins. These are safe to keep — they are **no-ops** in production builds and won't affect deployment.

If you get an error about `.figma/make/site.json` not found, make sure the `.figma/` directory is included when you clone the repository.

### Environment Variables

- `PORT` — Dev server port (defaults to `8443` if not set)
- `FIGMA_PUBLIC_URL` — Only used in Figma Make deployments; safe to ignore

### Node Version

This project requires **Node.js v22+**. If you're using `nvm`:

```bash
nvm install 22
nvm use 22
```

---

## 🛠️ Troubleshooting

| Problem                                    | Solution                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `pnpm: command not found`                  | Run `npm install -g pnpm@10.34.3`                                                             |
| `node: command not found`                  | Install Node.js v22+ from [nodejs.org](https://nodejs.org/)                                   |
| Port 8443 already in use                   | Set a different port: `PORT=3000 pnpm dev`                                                     |
| `Cannot find module '.figma/make/site.json'` | Make sure the `.figma/` directory exists. If missing, create `.figma/make/site.json` with `{}` |
| Dependency install fails                   | Delete `node_modules/` and `pnpm-lock.yaml`, then run `pnpm install` again                    |
| Build errors with TypeScript               | Run `pnpm build` — some TS warnings are non-blocking; the build should still succeed           |

---

