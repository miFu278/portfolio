# EmailJS Setup Guide

Follow these steps to setup EmailJS for your contact form:

## Step 1: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email

## Step 2: Add Email Service
1. Go to **Email Services** in dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the instructions to connect your email
5. Copy the **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template
1. Go to **Email Templates** in dashboard
2. Click **Create New Template**
3. Use this template structure:

```
Subject: New Contact from {{from_name}}

From: {{from_name}}
Email: {{email}}

Message:
{{message}}
```

4. Make sure the variable names match your form fields:
   - `from_name` → name field
   - `email` → email field  
   - `message` → message field
5. Copy the **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Public Key
1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `abcdefghijk123456`)

## Step 5: Configure Environment Variables
1. Create a `.env` file in your project root:
```bash
cp .env.example .env
```

2. Add your credentials to `.env`:
```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abcdefghijk123456
```

3. **Important**: Add `.env` to `.gitignore` to keep credentials private

## Step 6: Test
1. Restart your dev server: `npm run dev`
2. Go to contact section
3. Fill out the form and submit
4. Check your email inbox!

## Troubleshooting

### Form not sending?
- Check browser console for errors
- Verify all env variables are set correctly
- Make sure template variable names match form field names
- Check EmailJS dashboard for error logs

### Not receiving emails?
- Check spam folder
- Verify email service is connected properly
- Check EmailJS dashboard usage (free tier: 200 emails/month)

### Template variables not working?
Make sure your form fields have these exact names:
- `name` (will be sent as `from_name`)
- `email` (will be sent as `email`)
- `message` (will be sent as `message`)

## Free Tier Limits
- 200 emails per month
- 2 email services
- 2 email templates
- Basic support

Need more? Upgrade to paid plan at https://www.emailjs.com/pricing/
