# DocExpiry - Setup Instructions

Complete guide to set up and deploy the Document Expiry Notification System.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Email service provider (SMTP, SendGrid, Gmail, etc.)
- Vercel account (for deployment)

## Step 1: Database Setup

### 1.1 Create Supabase Tables

1. Go to your Supabase project
2. Open the SQL Editor
3. Run the SQL scripts in this order:
   - `scripts/001_create_documents_schema.sql`
   - `scripts/002_create_profile_trigger.sql`
   - `scripts/003_update_notifications_schema.sql`

### 1.2 Verify Tables

Ensure these tables exist:
- `profiles` - User profiles
- `documents` - Document tracking
- `notifications` - Notification records

## Step 2: Environment Variables

Create a `.env.local` file with these variables:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@docexpiry.app

# Cron Job Secret
CRON_SECRET=your_secret_cron_key
\`\`\`

### Email Setup Examples

#### Gmail
1. Enable 2FA on your Gmail account
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASSWORD`

#### SendGrid
\`\`\`env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
\`\`\`

#### Other SMTP Services
Use your provider's SMTP settings.

## Step 3: Local Development

### 3.1 Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3.2 Run Database Scripts

1. Execute the SQL scripts in the Supabase SQL Editor

### 3.3 Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000

### 3.4 Test Email Notifications

1. Create an account and log in
2. Add a test document
3. Go to Settings page
4. Click "Send Test Email"
5. Check your email inbox

## Step 4: Set Up Automated Notifications (Cron Jobs)

### Option A: Using Vercel Cron Jobs

1. Add this to `vercel.json`:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/check-expiring-documents",
      "schedule": "0 9 * * *"
    }
  ]
}
\`\`\`

2. Set environment variable in Vercel:
   - `CRON_SECRET` - A secure random string

3. The cron will run daily at 9 AM UTC

### Option B: Using External Service (Upstash, EasyCron, etc.)

Set up a webhook to call:
\`\`\`
POST /api/check-expiring-documents
Authorization: Bearer YOUR_CRON_SECRET
\`\`\`

## Step 5: Deployment to Vercel

### 5.1 Push to GitHub

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### 5.2 Deploy to Vercel

1. Visit https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables
4. Deploy

### 5.3 Set Vercel Environment Variables

In your Vercel project settings, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `CRON_SECRET`

## Features

### For Users

- **Upload Documents**: Add driver's licenses, passports, and other documents
- **Track Expiration**: Monitor expiration dates in real-time
- **Get Alerts**: Receive email notifications before expiration
- **Quick Renewal**: Direct links to renewal portals
- **Notification Center**: View all alerts and mark as read
- **Settings**: Configure notification preferences

### Automatic Features

- **Email Notifications**: Sent daily for expiring documents
- **Notification History**: All alerts stored in the dashboard
- **RLS Security**: Each user can only see their own data

## Troubleshooting

### Emails Not Sending

1. Check email credentials in environment variables
2. Verify SMTP settings with your email provider
3. Check spam folder
4. Review API logs for errors

### Cron Job Not Running

1. Verify `CRON_SECRET` is set in Vercel
2. Check function logs in Vercel dashboard
3. Ensure API endpoint is accessible

### Database Connection Issues

1. Verify Supabase URL and keys
2. Check if database is accessible
3. Review Supabase logs for errors

## Security Notes

- Never commit `.env.local` to version control
- Use strong email passwords and cron secrets
- Enable Row Level Security (RLS) on all tables
- Regularly rotate email credentials

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in Supabase and Vercel dashboards
3. Check email provider documentation
