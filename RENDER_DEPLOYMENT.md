# Render Deployment Guide for Kinna Backend

## Quick Deploy to Render (5 minutes)

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database
1. Click **New +** → **PostgreSQL**
2. Name: `kinna-postgres`
3. Database: `kinna_db`
4. User: `postgres`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click **Create Database**
8. Wait ~2 minutes for it to provision
9. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 3: Deploy Backend
1. Click **New +** → **Web Service**
2. Connect your repository: `RentableBalloon/Kinna`
3. Configure:
   - **Name**: `kinna-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `packages/backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### Step 4: Add Environment Variables
Click **Advanced** → **Add Environment Variable** for each:

```
NODE_ENV=production
PORT=5000
DB_HOST=<from database internal URL>
DB_PORT=5432
DB_NAME=kinna_db
DB_USER=postgres
DB_PASSWORD=<from database internal URL>
JWT_SECRET=<generate a random 64-char string>
ALLOWED_ORIGINS=https://rentableballoon.github.io,https://kinna.online,http://localhost:5173
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=support@kinna.online
SMTP_PASSWORD=Midas2025!
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**For Database Connection:** You can use the full `DATABASE_URL` or individual vars:
- From the database's Internal URL: `postgresql://postgres:PASSWORD@HOST:5432/kinna_db`
- Extract HOST and PASSWORD for DB_HOST and DB_PASSWORD

### Step 5: Initialize Database Schema
Once deployed, run this once to create tables:

1. Go to your database in Render dashboard
2. Click **Connect** → **External Connection**
3. Use the provided PSQL command in your terminal:
```bash
psql postgresql://postgres:PASSWORD@HOST:5432/kinna_db < database/schema.sql
```

Or connect via Render's web shell:
```sql
-- Copy paste schema.sql contents
```

### Step 6: Update Frontend
1. After backend deploys, you'll get a URL like: `https://kinna-backend.onrender.com`
2. Update `packages/frontend/.env.production`:
```env
VITE_API_URL=https://kinna-backend.onrender.com/api
```

3. Commit and push:
```bash
git add .
git commit -m "Configure production backend URL"
git push origin main
```

4. GitHub Actions will redeploy your frontend automatically

### Step 7: Test
Visit https://kinna.online and try registering!

## Important Notes

### Free Tier Limitations
- Backend spins down after 15 min of inactivity
- First request after idle: 30-50 second cold start
- Database: 1GB storage, 97 hours/month uptime

### Upgrading to Paid ($7/month)
- No cold starts
- Always-on backend
- More resources

### Database Backups
Free tier doesn't include automatic backups. To backup:
```bash
pg_dump postgresql://postgres:PASSWORD@HOST:5432/kinna_db > backup.sql
```

### Monitoring
- View logs in Render dashboard under your service
- Check health: `https://kinna-backend.onrender.com/health`

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure database is running

### Database connection failed
- Verify DB_HOST uses the **Internal URL** hostname
- Check DB_PASSWORD matches database password
- Ensure database and backend are in same region

### CORS errors
- Verify ALLOWED_ORIGINS includes your frontend URL
- Check frontend is using correct API URL

### Email not sending
- Verify SMTP credentials are correct
- Check backend logs for email errors
- Test with: `https://kinna-backend.onrender.com/api/auth/register`

## Alternative: Using Render.yaml

Instead of manual setup, you can use Infrastructure as Code:

1. Ensure `render.yaml` is in your repo root
2. Go to Render Dashboard → **New** → **Blueprint**
3. Connect your repo
4. Render will read `render.yaml` and create everything
5. Just add SMTP credentials manually after

## Cost Estimate

**Free Plan:**
- PostgreSQL: $0
- Web Service: $0
- Total: **$0/month**

**Starter Plan (recommended for production):**
- PostgreSQL: $7/month
- Web Service: $7/month  
- Total: **$14/month**

---

Need help? Check Render docs: https://render.com/docs
