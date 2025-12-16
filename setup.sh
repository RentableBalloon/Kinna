#!/bin/bash

# Kinna Setup Script
echo "🚀 Setting up Kinna..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "📦 Starting PostgreSQL..."
    sudo service postgresql start
fi

# Check if database exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw kinna_db; then
    echo "✅ Database kinna_db already exists"
else
    echo "📚 Creating database..."
    sudo -u postgres createdb kinna_db
    echo "📝 Loading schema..."
    sudo -u postgres psql kinna_db < database/schema.sql
fi

# Setup backend environment
if [ ! -f packages/backend/.env ]; then
    echo "⚙️  Creating backend .env file..."
    cp packages/backend/.env.example packages/backend/.env
    sed -i 's/DB_PASSWORD=your_password_here/DB_PASSWORD=/' packages/backend/.env
    sed -i 's/JWT_SECRET=your_very_long_and_secure_secret_key_here/JWT_SECRET=kinna_super_secret_jwt_key_2025_midas_studios_development_only/' packages/backend/.env
fi

# Setup frontend environment
if [ ! -f packages/frontend/.env ]; then
    echo "⚙️  Creating frontend .env file..."
    cp packages/frontend/.env.example packages/frontend/.env
fi

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd packages/backend && npm run dev"
echo "  2. Frontend: cd packages/frontend && npm run dev"
echo ""
echo "Or run both in tmux:"
echo "  ./start-dev.sh"
