# Deploying Kinna to GitHub Pages

This guide explains how to deploy Kinna's frontend to GitHub Pages.

## Overview

GitHub Pages will host the **frontend only** as a static site. The backend API needs to be deployed separately (see Backend Deployment section).

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/RentableBalloon/Kinna
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. Save changes

### 2. Configure Backend API URL

Before deploying, you need a backend API server. Options:

#### Option A: Deploy Backend to Render/Railway/Heroku

1. Deploy the backend from `packages/backend` to a hosting service
2. Update the API URL in `.github/workflows/deploy.yml`:
```yaml
env:
  VITE_API_URL: https://your-backend-url.com/api
```

#### Option B: Use Mock API (Demo Mode)

For a demo without backend, you can modify the frontend to use mock data.

### 3. Deploy

Once configured, deployment is automatic:

1. **Push to main branch**:
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

2. **GitHub Actions will automatically**:
   - Install dependencies
   - Build the frontend
   - Deploy to GitHub Pages

3. **View deployment status**:
   - Go to the **Actions** tab in GitHub
   - Watch the "Deploy to GitHub Pages" workflow

4. **Access your site**:
   - Your site will be live at: `https://rentableballoon.github.io/Kinna/`

### 4. Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

## Configuration Files

### `.github/workflows/deploy.yml`
GitHub Actions workflow that builds and deploys the site automatically.

### `vite.config.ts`
Updated with:
- `base: '/Kinna/'` - Required for GitHub Pages subdirectory
- Build optimizations and code splitting

### `.env.production`
Production environment variables:
- `VITE_API_URL` - Your backend API URL

## Backend Deployment Options

The backend (`packages/backend`) needs to be deployed separately:

### Recommended Platforms:

1. **Render** (Free tier available)
   - Easy PostgreSQL database
   - Automatic deployments
   - https://render.com

2. **Railway** (Free trial)
   - Quick setup
   - Built-in PostgreSQL
   - https://railway.app

3. **Fly.io** (Free tier)
   - Global deployment
   - PostgreSQL add-on
   - https://fly.io

4. **Heroku** (Paid)
   - Established platform
   - PostgreSQL add-ons
   - https://heroku.com

### Backend Deployment Steps:

1. Choose a platform
2. Connect your GitHub repo
3. Set environment variables:
   - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`
   - `PORT=5000`
4. Deploy from `packages/backend`
5. Copy the deployment URL
6. Update `VITE_API_URL` in the GitHub Actions workflow

## Testing Locally

Test the production build locally before deploying:

```bash
cd packages/frontend

# Build for production
npm run build

# Preview the build
npm run preview
```

Visit http://localhost:4173 to test.

## Troubleshooting

### 404 Errors

If you get 404 errors, make sure:
- GitHub Pages is enabled in repository settings
- The workflow completed successfully
- The `base` path in vite.config.ts matches your repo name

### API Errors

If the frontend loads but API calls fail:
- Check the backend is deployed and running
- Verify `VITE_API_URL` in the workflow file
- Check browser console for CORS errors
- Ensure backend allows your GitHub Pages domain in CORS settings

### Routing Issues

For client-side routing to work on GitHub Pages, we include a `404.html` that redirects to `index.html`. This is handled automatically in the build.

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `packages/frontend/public/` with your domain
2. Configure DNS with your domain provider
3. Update `base: '/'` in vite.config.ts
4. Enable HTTPS in GitHub Pages settings

## Development vs Production

- **Development**: `npm run dev` - Uses local backend at localhost:5000
- **Production**: GitHub Pages - Uses deployed backend API

## Next Steps

After deployment:

1. ✅ Frontend live on GitHub Pages
2. 🔲 Deploy backend to Render/Railway
3. 🔲 Update API URL in workflow
4. 🔲 Set up database on hosting platform
5. 🔲 Configure environment variables
6. 🔲 Test end-to-end functionality

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
