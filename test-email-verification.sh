#!/bin/bash
# Test Email Verification Flow
# Make sure backend is running on http://localhost:5000

API_URL="http://localhost:5000/api/auth"

echo "🧪 Testing Email Verification Flow"
echo "===================================="
echo ""

# Test 1: Register a new user
echo "📝 Step 1: Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser'$(date +%s)'",
    "email": "your-test-email@zoho.com",
    "password": "testpass123",
    "name": "Test User",
    "age": 25
  }')

echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Extract user email from response
USER_EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.user.email')
echo "📧 User registered with email: $USER_EMAIL"
echo "⏰ Check your email for the 6-digit verification code"
echo ""

# Test 2: Prompt for verification code
read -p "Enter the 6-digit code from your email: " VERIFICATION_CODE

echo ""
echo "✅ Step 2: Verifying email with code: $VERIFICATION_CODE"
VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/verify-email" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"code\": \"$VERIFICATION_CODE\"
  }")

echo "$VERIFY_RESPONSE" | jq '.'
echo ""

# Test 3: Test resend functionality
echo "🔄 Step 3: Testing resend verification code..."
RESEND_RESPONSE=$(curl -s -X POST "$API_URL/resend-verification" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\"
  }")

echo "$RESEND_RESPONSE" | jq '.'
echo ""

echo "✅ Email verification flow test complete!"
echo ""
echo "📊 Summary:"
echo "- Registration sends verification code"
echo "- Verification marks user as verified"
echo "- Resend allows getting new codes (with rate limit)"
