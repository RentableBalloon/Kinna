#!/bin/bash

echo "🐳 Starting Kinna Database with Docker..."

# Stop any existing container
docker-compose down 2>/dev/null

# Start PostgreSQL
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Wait for database to be healthy
until docker-compose exec -T postgres pg_isready -U postgres -d kinna_db > /dev/null 2>&1; do
  echo "⏳ Waiting for database..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"
echo ""
echo "📊 Database Info:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: kinna_db"
echo "  User: postgres"
echo "  Password: kinna_dev_password"
echo ""
echo "🚀 You can now start the backend:"
echo "  cd packages/backend && npm run dev"
echo ""
echo "🛠️  Useful commands:"
echo "  docker-compose logs postgres   # View database logs"
echo "  docker-compose down            # Stop database"
echo "  docker-compose restart         # Restart database"
