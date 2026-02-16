# Push Notification Setup Guide

This guide will walk you through setting up push notifications for your Ghost CMS mobile app using Ghost webhooks, Supabase, and n8n.

## Architecture Overview

```
Ghost CMS (Webhook) → n8n (Workflow) → Supabase (Get Tokens) → Expo Push API → Mobile App
```

---

## Part 1: Install Required Packages

First, install the necessary dependencies:

```bash
npm install expo-notifications @supabase/supabase-js
```

---

## Part 2: Configure Environment Variables

Add these environment variables to your `.env` file:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Expo Project ID (get from app.json or expo.dev)
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

**How to get these values:**

1. **Supabase URL & Key**:
   - Go to your Supabase project dashboard
   - Click on "Settings" → "API"
   - Copy the "Project URL" and "anon/public" key

2. **Expo Project ID**:
   - Check your `app.json` file under `extra.eas.projectId`
   - Or go to https://expo.dev and find your project

---

## Part 3: Supabase Database Setup

### Step 1: Create the `push_tokens` table

In your Supabase SQL Editor, run this SQL:

```sql
-- Create push_tokens table
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  platform TEXT DEFAULT 'expo',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON public.push_tokens(active) WHERE active = true;

-- Enable Row Level Security
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for registering tokens)
CREATE POLICY "Allow anonymous token registration"
  ON public.push_tokens
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow anonymous updates (for updating tokens)
CREATE POLICY "Allow anonymous token updates"
  ON public.push_tokens
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policy to allow service role to read all tokens
CREATE POLICY "Allow service role to read tokens"
  ON public.push_tokens
  FOR SELECT
  TO service_role
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Get your Supabase Service Role Key

For n8n to read the push tokens, you need the **service_role** key (not the anon key):

1. Go to Supabase Dashboard → Settings → API
2. Copy the `service_role` key (⚠️ Keep this secret!)
3. Save it for the n8n configuration below

---

## Part 4: Ghost CMS Webhook Setup

### Step 1: Access Ghost Admin

1. Log into your Ghost admin panel at `https://your-ghost-site.com/ghost`
2. Go to **Settings** → **Integrations**
3. Click **Add custom integration**

### Step 2: Create Custom Integration

1. Name it: "Push Notifications" or "n8n Webhook"
2. Click **Create**
3. You'll see the integration page with webhook options

### Step 3: Configure Webhook

1. Scroll to **Webhooks** section
2. Click **Add webhook**
3. Fill in:
   - **Name**: `Post Published Notification`
   - **Event**: Select `Post published`
   - **Target URL**: Your n8n webhook URL (we'll create this in Part 5)
     - Format: `https://your-n8n-instance.com/webhook/ghost-post-published`

4. Click **Create webhook**

### Step 4: (Optional) Test Tag

If you want to send notifications only for specific posts:

1. In Ghost admin, go to **Settings** → **Tags**
2. Create a new tag: `notify` (or `push-notification`)
3. When creating posts, add this tag only to posts that should trigger notifications

---

## Part 5: n8n Workflow Configuration

### Step 1: Create Webhook Trigger

1. In n8n, create a new workflow
2. Add a **Webhook** node:
   - **HTTP Method**: POST
   - **Path**: `ghost-post-published`
   - **Respond**: Immediately
   - **Response Code**: 200

3. Save and copy the webhook URL
4. Go back to Ghost and add this URL to the webhook configuration (Part 4, Step 3)

### Step 2: Extract Post Data

Add a **Set** node to extract the post data:

```javascript
{
  "slug": "{{ $json.post.current.slug }}",
  "title": "{{ $json.post.current.title }}",
  "excerpt": "{{ $json.post.current.excerpt }}",
  "feature_image": "{{ $json.post.current.feature_image }}",
  "published_at": "{{ $json.post.current.published_at }}",
  "tags": "{{ $json.post.current.tags }}"
}
```

### Step 3: (Optional) Filter by Tag

Add an **IF** node to check if post should send notification:

```javascript
// Expression
{{ $json.tags.some(tag => tag.slug === 'notify') }}
```

- **True branch**: Continue to send notification
- **False branch**: Stop workflow

### Step 4: Get Active Push Tokens from Supabase

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `https://your-project.supabase.co/rest/v1/push_tokens?active=eq.true&select=token`
- **Authentication**: Generic Credential Type
  - **Generic Auth Type**: Header Auth
  - **Name**: `apikey`
  - **Value**: `YOUR_SUPABASE_SERVICE_ROLE_KEY`
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY`
  - `Prefer`: `return=representation`

### Step 5: Transform Tokens Array

Add a **Function** node:

```javascript
// Extract just the token strings
const tokens = $input.all().map(item => item.json.token);

// Expo limits to 100 notifications per request
// Split into batches if needed
const batchSize = 100;
const batches = [];

for (let i = 0; i < tokens.length; i += batchSize) {
  batches.push(tokens.slice(i, i + batchSize));
}

return batches.map(batch => ({ json: { tokens: batch } }));
```

### Step 6: Send Push Notifications

Add an **HTTP Request** node:

- **Method**: POST
- **URL**: `https://exp.host/--/api/v2/push/send`
- **Send Body**: Yes (JSON)
- **Body Content Type**: JSON
- **Specify Body**: Using Fields Below
- **Body Parameters**:

```json
{
  "to": "={{ $json.tokens }}",
  "title": "={{ $('Extract Post Data').item.json.title }}",
  "body": "={{ $('Extract Post Data').item.json.excerpt || 'Lexo artikullin e ri' }}",
  "data": {
    "slug": "={{ $('Extract Post Data').item.json.slug }}"
  },
  "sound": "default",
  "badge": 1,
  "priority": "high",
  "channelId": "default"
}
```

### Step 7: (Optional) Log Results

Add a **Set** node to log the results:

```javascript
{
  "timestamp": "{{ new Date().toISOString() }}",
  "post_slug": "={{ $('Extract Post Data').item.json.slug }}",
  "notifications_sent": "={{ $json.data.length }}",
  "status": "success"
}
```

### Complete n8n Workflow Diagram

```
┌─────────────────┐
│  Webhook        │
│  Trigger        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract Post   │
│  Data (Set)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check Tag?     │
│  (IF - Optional)│
└────────┬────────┘
         │ (true)
         ▼
┌─────────────────┐
│  Get Tokens     │
│  from Supabase  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Transform      │
│  Tokens (Func)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send Push      │
│  Notifications  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Log Results    │
│  (Optional)     │
└─────────────────┘
```

---

## Part 6: Testing

### Test 1: App Registration

1. Build and run your app on a physical device (push notifications don't work on simulators)
2. Grant notification permissions when prompted
3. Check Supabase dashboard → Table Editor → `push_tokens`
4. You should see your device token registered

### Test 2: Manual Notification

Use Expo's push notification tool:

1. Go to https://expo.dev/notifications
2. Enter your Expo push token (visible in app logs)
3. Fill in:
   - **Title**: Test Notification
   - **Body**: This is a test
   - **Data (JSON)**:
     ```json
     {
       "slug": "your-test-post-slug"
     }
     ```
4. Click "Send a Notification"
5. You should receive the notification on your device

### Test 3: End-to-End with Ghost

1. In Ghost admin, create a new post
2. Add the `notify` tag (if you set up tag filtering)
3. Publish the post
4. Check n8n execution log - should show successful execution
5. You should receive a push notification on your device

---

## Part 7: Troubleshooting

### No notifications received?

1. **Check device permissions**: Settings → [Your App] → Notifications → Enabled
2. **Check Supabase**: Verify token is registered in `push_tokens` table
3. **Check n8n logs**: Look for errors in the workflow execution
4. **Check Expo response**: Look for errors like invalid token format

### Notifications work but don't navigate?

- Check the `data.slug` value in the notification payload
- Verify the article exists in your Ghost CMS
- Check app logs for navigation errors

### Ghost webhook not triggering?

1. Check Ghost admin → Settings → Integrations → Your integration
2. Verify webhook URL is correct
3. Test the webhook manually with a tool like Postman
4. Check n8n webhook node is active and workflow is activated

---

## Part 8: Going to Production

### 1. Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS and Android
eas build --platform all
```

### 2. Submit to App Stores

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

### 3. Security Checklist

- ✅ Keep Supabase service_role key secret (only use in n8n, not in app)
- ✅ Enable RLS (Row Level Security) on Supabase tables
- ✅ Use HTTPS for all API endpoints
- ✅ Rate limit your n8n webhook to prevent abuse
- ✅ Monitor push notification quotas (Expo has limits)

---

## Additional Features

### Feature 1: Notification Preferences

Allow users to select which tags they want notifications for:

1. Add a settings screen in your app
2. Store user preferences in Supabase with user_id
3. Update n8n to filter tokens by tag preferences

### Feature 2: Analytics

Track notification performance:

1. Add a `notification_logs` table in Supabase
2. Log each notification sent
3. Track open rates, click-through rates

### Feature 3: Scheduled Notifications

Send notifications at optimal times:

1. Use n8n's Schedule Trigger instead of webhook
2. Fetch recent posts from Ghost API
3. Send at specific times (e.g., 9 AM daily digest)

---

## Support

If you encounter issues:

1. Check the [Expo Notifications docs](https://docs.expo.dev/push-notifications/overview/)
2. Check the [Supabase docs](https://supabase.com/docs)
3. Check the [Ghost webhook docs](https://ghost.org/docs/webhooks/)
4. Check the [n8n docs](https://docs.n8n.io/)

---

## Summary Checklist

- [ ] Install packages: `expo-notifications`, `@supabase/supabase-js`
- [ ] Configure environment variables
- [ ] Create `push_tokens` table in Supabase
- [ ] Get Supabase service_role key
- [ ] Create Ghost custom integration
- [ ] Add Ghost webhook for "Post published" event
- [ ] Create n8n workflow with 6 nodes
- [ ] Test with manual notification
- [ ] Test with Ghost post publish
- [ ] Deploy to production

That's it! You now have a complete push notification system for your Ghost CMS mobile app. 🎉
