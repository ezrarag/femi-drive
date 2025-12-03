# Slack Integration Setup Guide

This guide will help you set up Slack integration for the FemiLeasing admin dashboard.

## Prerequisites

- A Slack workspace where you have admin permissions
- Access to Slack API credentials

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. Enter app name: **"FemiLeasing Admin"**
5. Select your workspace
6. Click **"Create App"**

## Step 2: Configure OAuth & Permissions

1. In your app settings, go to **"OAuth & Permissions"** in the sidebar
2. Scroll down to **"Scopes"** → **"Bot Token Scopes"**
3. Add the following scopes:
   - `channels:read` - View basic information about public channels
   - `channels:history` - View messages in public channels
   - `chat:write` - Send messages as the app
   - `chat:write.public` - Send messages to channels the app isn't in
   - `users:read` - View people in the workspace
   - `im:read` - View basic information about direct messages
   - `im:history` - View messages in direct messages
   - `im:write` - Send direct messages

## Step 3: Install App to Workspace

1. Scroll up to **"OAuth Tokens for Your Workspace"**
2. Click **"Install to Workspace"**
3. Review permissions and click **"Allow"**
4. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)

## Step 4: Add Environment Variables

Add the following to your `.env.local` file:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
```

To get your signing secret:
1. Go to **"Basic Information"** in your app settings
2. Find **"App Credentials"** → **"Signing Secret"**
3. Click **"Show"** and copy the secret

## Step 5: Set Up Slack Webhook (Optional)

For receiving messages in Slack:

1. Go to **"Incoming Webhooks"** in your app settings
2. Toggle **"Activate Incoming Webhooks"** to **On**
3. Click **"Add New Webhook to Workspace"**
4. Select the channel where you want notifications
5. Copy the webhook URL

Add to `.env.local`:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Step 6: Set Up Event Subscriptions (Optional)

For real-time message updates:

1. Go to **"Event Subscriptions"** in your app settings
2. Toggle **"Enable Events"** to **On**
3. Enter your Request URL: `https://yourdomain.com/api/slack/events`
4. Subscribe to bot events:
   - `message.channels` - Messages posted to channels
   - `message.im` - Direct messages sent to the app
   - `message.groups` - Messages posted to private channels

## Step 7: Test the Integration

1. Go to your admin dashboard → **Integrations**
2. Find **"Slack Connect"** card
3. Click **"Connect"**
4. You should see a success message and the status should change to "Connected"

## Troubleshooting

### Token Issues
- Make sure your Bot Token starts with `xoxb-`
- Verify the token hasn't expired
- Check that the app is installed in your workspace

### Permission Issues
- Ensure all required scopes are added
- Reinstall the app if you added new scopes

### Webhook Issues
- Verify the webhook URL is correct
- Test the webhook using curl:
  ```bash
  curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Hello from FemiLeasing!"}' \
  YOUR_WEBHOOK_URL
  ```

## Next Steps

Once connected, you can:
- Send notifications to Slack channels
- Receive customer messages in Slack
- Set up automated alerts for bookings, payments, etc.

For more information, visit the [Slack API Documentation](https://api.slack.com/).

