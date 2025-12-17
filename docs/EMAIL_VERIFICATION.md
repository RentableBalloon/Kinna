# Email Verification Setup Guide

## Overview
Kinna now includes email verification with 6-digit verification codes sent to new users upon registration. This guide will help you set up email sending using Zoho Mail SMTP.

## Features
- ✅ Random 6-digit verification code generation
- ✅ Automatic email sending on registration
- ✅ 15-minute code expiration
- ✅ Resend verification code functionality
- ✅ Rate limiting (1 minute between resend requests)
- ✅ Beautiful HTML email templates
- ✅ Welcome email after successful verification

## Database Changes
A new table `email_verification_codes` has been added to store verification codes:
```sql
CREATE TABLE email_verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, code)
);
```

## Zoho Mail SMTP Setup

### Step 1: Get Zoho App Password
1. Log in to your Zoho Mail account at https://mail.zoho.com
2. Go to **Settings** → **Security** (or direct link: https://accounts.zoho.com/home#security)
3. Scroll to **App Passwords** section
4. Click **Generate New Password**
5. Give it a name (e.g., "Kinna App")
6. Copy the generated password - **you won't see it again!**

### Step 2: Configure Environment Variables
Add these variables to your `.env` file in `/packages/backend/`:

```env
# Email Configuration (Zoho SMTP)
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=your-email@zoho.com
SMTP_PASSWORD=your_app_password_from_step_1
```

**Important Notes:**
- Use your **App Password**, NOT your regular Zoho account password
- The SMTP_USER should be your full Zoho email address
- Port 465 uses SSL/TLS encryption

### Alternative SMTP Settings (if port 465 doesn't work)
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
# Set secure to false in email.service.ts for port 587
```

## API Endpoints

### 1. Register User (Modified)
**POST** `/api/auth/register`

Now sends a verification email after successful registration.

**Response includes:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "name": "string",
    "is_verified": false,
    ...
  },
  "token": "jwt_token",
  "message": "Registration successful. Please check your email for verification code."
}
```

### 2. Verify Email (New)
**POST** `/api/auth/verify-email`

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully!",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "name": "string",
    "is_verified": true,
    ...
  }
}
```

**Error Responses:**
- `400` - Invalid verification code
- `400` - Code already used
- `400` - Code expired

### 3. Resend Verification Code (New)
**POST** `/api/auth/resend-verification`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Verification code sent successfully. Please check your email."
}
```

**Error Responses:**
- `404` - No account found with this email
- `400` - Email already verified
- `429` - Too many requests (wait 60 seconds)
- `500` - Failed to send email

## Email Templates

### Verification Email
- Beautiful HTML design with gradient header
- Large, easy-to-read 6-digit code
- Expiration warning (15 minutes)
- Fallback plain text version

### Welcome Email
- Sent automatically after successful verification
- Lists key features of the platform
- Encourages user engagement

## Testing

### Manual Testing
1. Register a new user account
2. Check the email inbox for verification code
3. Use the `/api/auth/verify-email` endpoint with the code
4. Verify that `is_verified` is now `true` in the database

### Without Email Configuration
If SMTP credentials are not configured:
- Registration will still work
- A warning will be logged: `⚠️ Email credentials not configured`
- Users won't receive emails but can still use the platform
- You can manually set `is_verified = true` in the database for testing

### Development Tips
1. Use a test email account for development
2. Check spam folder if emails aren't arriving
3. Monitor backend console for email sending status:
   - `✅ Email service initialized`
   - `✅ Verification email sent: <message-id>`
   - `❌ Error sending verification email` (if failed)

## Security Features

1. **Rate Limiting**: Users can only request a new verification code once per minute
2. **Code Expiration**: Codes expire after 15 minutes
3. **One-Time Use**: Each code can only be used once
4. **Secure Storage**: Codes are stored with user ID association
5. **SMTP Security**: Uses SSL/TLS encryption (port 465)

## Troubleshooting

### Emails Not Sending
1. Verify SMTP credentials are correct
2. Check that you're using the **App Password**, not your regular password
3. Ensure Zoho account is active and verified
4. Check backend console logs for specific errors
5. Try using port 587 instead of 465

### "Invalid Credentials" Error
- Double-check your App Password
- Make sure SMTP_USER is your full email address
- Regenerate a new App Password if needed

### Emails Going to Spam
- Add SPF and DKIM records to your domain (if using custom domain)
- Use a verified sender address
- Ensure email content isn't triggering spam filters

### Rate Limit Issues
- Wait 60 seconds between resend requests
- Clear old verification codes from database if testing frequently

## Database Migration

To apply the schema changes, run:
```bash
cd packages/backend
psql -U postgres -d kinna_db -f ../../database/schema.sql
```

Or use your preferred migration tool to add the `email_verification_codes` table.

## Future Enhancements

Potential improvements:
- [ ] Email templates customization
- [ ] Multi-language support for emails
- [ ] SMS verification as alternative
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
- [ ] Email notification preferences
- [ ] Batch email sending for announcements

## Support

For issues related to:
- **Zoho SMTP**: Check Zoho Mail documentation
- **Nodemailer**: Visit https://nodemailer.com/
- **Application issues**: Check backend console logs and database

---

**Last Updated:** December 17, 2025
**Package Dependencies:** nodemailer v6.9.x, @types/nodemailer v6.4.x
