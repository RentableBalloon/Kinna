# Quick Start: Email Verification Setup

## What You Need to Do Now

### 1. Get Your Zoho App Password
1. Go to https://accounts.zoho.com/home#security
2. Find **App Passwords** section
3. Click **Generate New Password**
4. Name it "Kinna" and copy the password

### 2. Configure Your Backend
Create or update `/workspaces/Kinna/packages/backend/.env` with:

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=your-actual-email@zoho.com
SMTP_PASSWORD=paste_your_app_password_here
```

**Replace:**
- `your-actual-email@zoho.com` with your Zoho email address
- `paste_your_app_password_here` with the app password you just generated

### 3. Update Database Schema
Run the migration to add the verification table:

```bash
cd /workspaces/Kinna
psql -U postgres -d kinna_db -f database/schema.sql
```

Or if you're using Docker/dev container:
```bash
cd /workspaces/Kinna
psql -h localhost -U postgres -d kinna_db -f database/schema.sql
```

### 4. Restart Backend Server
```bash
cd /workspaces/Kinna/packages/backend
npm run dev
```

Look for this message in the console:
```
✅ Email service initialized
```

### 5. Test It Out!
1. Register a new user account
2. Check your email for a 6-digit code
3. The code expires in 15 minutes
4. Use `/api/auth/verify-email` endpoint to verify

## API Quick Reference

### Register (Modified)
```bash
POST /api/auth/register
# Now sends verification email automatically
```

### Verify Email (New)
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

### Resend Code (New)
```bash
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Troubleshooting

**No email received?**
- Check spam folder
- Verify SMTP credentials in `.env`
- Check backend console for errors
- Make sure you used the App Password, not regular password

**"Email credentials not configured" warning?**
- Check that `.env` file exists in `/packages/backend/`
- Verify all SMTP_* variables are set
- Restart the backend server

**Need help?**
- Full documentation: [docs/EMAIL_VERIFICATION.md](docs/EMAIL_VERIFICATION.md)
- Check backend console logs for specific errors

---

That's it! Your email verification system is ready to go. 🎉
