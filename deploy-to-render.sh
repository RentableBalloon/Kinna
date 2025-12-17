#!/bin/bash

echo "🚀 Kinna Backend - Render Deployment Setup"
echo "=========================================="
echo ""

# Step 1: Instructions
echo "📋 Follow these steps to deploy your backend to Render:"
echo ""
echo "1️⃣  Go to https://render.com and sign in with GitHub"
echo ""
echo "2️⃣  Create PostgreSQL Database:"
echo "   • Click 'New +' → 'PostgreSQL'"
echo "   • Name: kinna-postgres"
echo "   • Region: Choose closest to you"
echo "   • Plan: Free"
echo "   • Click 'Create Database'"
echo "   • Copy the Internal Database URL"
echo ""
echo "3️⃣  Create Web Service:"
echo "   • Click 'New +' → 'Web Service'"
echo "   • Connect repository: RentableBalloon/Kinna"
echo "   • Root Directory: packages/backend"
echo "   • Build Command: npm install && npm run build"
echo "   • Start Command: npm start"
echo "   • Plan: Free"
echo ""
echo "4️⃣  Add Environment Variables in Render:"
echo ""

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -hex 32)

echo "   Copy these into Render's Environment Variables:"
echo "   ================================================"
echo ""
cat << EOF
NODE_ENV=production
PORT=5000
DB_HOST=<paste from database internal URL>
DB_PORT=5432
DB_NAME=kinna_db
DB_USER=postgres
DB_PASSWORD=<paste from database internal URL>
JWT_SECRET=${JWT_SECRET}
ALLOWED_ORIGINS=https://rentableballoon.github.io,https://kinna.online,http://localhost:5173
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=support@kinna.online
SMTP_PASSWORD=Midas2025!
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
EOF
echo ""
echo "   ================================================"
echo ""
echo "5️⃣  After backend deploys, copy your backend URL (e.g., https://kinna-backend.onrender.com)"
echo ""
echo "6️⃣  Update frontend .env.production with:"
echo "   VITE_API_URL=https://your-backend-url.onrender.com/api"
echo ""
echo "7️⃣  Initialize database schema:"
echo "   • Connect to your Render PostgreSQL"
echo "   • Run: psql <DATABASE_URL> < database/schema.sql"
echo ""
echo "8️⃣  Commit and push to deploy frontend:"
echo "   git add ."
echo "   git commit -m 'Configure production backend'"
echo "   git push origin main"
echo ""
echo "✅ Your app will be live at https://kinna.online!"
echo ""
echo "📚 Full guide: See RENDER_DEPLOYMENT.md"
echo ""
