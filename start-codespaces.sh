#!/bin/bash

echo "🚀 Starting Kinna in Codespaces"
echo "================================"
echo ""

# Start PostgreSQL if not running
if ! docker ps | grep -q kinna_postgres; then
    echo "📦 Starting PostgreSQL..."
    docker-compose up -d postgres
    sleep 5
fi

# Check database is ready
echo "🔍 Checking database..."
until docker exec kinna_postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "⏳ Waiting for database..."
    sleep 2
done
echo "✅ Database ready!"

# Get Codespace URL
CODESPACE_URL="https://${CODESPACE_NAME}-5000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

echo ""
echo "📡 Your backend will be available at:"
echo "   $CODESPACE_URL"
echo ""
echo "⚠️  IMPORTANT: Make port 5000 PUBLIC"
echo "   1. Go to the PORTS tab (next to TERMINAL)"
echo "   2. Right-click port 5000"
echo "   3. Select 'Port Visibility' → 'Public'"
echo ""
echo "🌐 Your frontend (kinna.online) is configured to use this URL"
echo ""
echo "Starting backend server..."
echo ""

# Start backend
cd /workspaces/Kinna/packages/backend && npm run dev
