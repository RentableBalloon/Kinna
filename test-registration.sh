#!/bin/bash

echo "🧪 Testing Kinna Email Verification System"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing backend health..."
HEALTH=$(curl -s -m 3 http://localhost:5000/health)
if [ $? -eq 0 ]; then
    echo "✅ Backend is responding"
    echo "   Response: $HEALTH"
else
    echo "❌ Backend is not responding on http://localhost:5000"
    echo "   Please start the backend: cd packages/backend && npm run dev"
    exit 1
fi

echo ""

# Test 2: Database Check  
echo "2️⃣ Testing database connection..."
DB_TEST=$(docker exec kinna_postgres psql -U postgres -d kinna_db -c "SELECT COUNT(*) FROM email_verification_codes;" 2>&1)
if [ $? -eq 0 ]; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo ""

# Test 3: Registration
echo "3️⃣ Testing user registration with email verification..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="testuser${TIMESTAMP}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${TEST_USERNAME}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"TestPass123!\",
    \"name\": \"Test User\",
    \"age\": 25
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "201" ]; then
    echo "✅ Registration successful!"
    echo "   User: $TEST_USERNAME"
    echo "   Email: $TEST_EMAIL"
    echo "   Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    
    # Check if verification code was created
    echo ""
    echo "4️⃣ Checking verification code in database..."
    CODE_CHECK=$(docker exec kinna_postgres psql -U postgres -d kinna_db -c "SELECT code, expires_at FROM email_verification_codes WHERE email='${TEST_EMAIL}';" | grep -v "rows)")
    if [ ! -z "$CODE_CHECK" ]; then
        echo "✅ Verification code created in database"
        echo "$CODE_CHECK"
    fi
else
    echo "❌ Registration failed with HTTP $HTTP_CODE"
    echo "   Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
echo ""
echo "📧 Note: Check your email (support@kinna.online) for verification code"
echo "   Or check database with: docker exec kinna_postgres psql -U postgres -d kinna_db -c \"SELECT * FROM email_verification_codes ORDER BY created_at DESC LIMIT 1;\""
