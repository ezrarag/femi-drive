# ReadyAimGo Integration Guide

This document describes how FemiLeasing integrates with ReadyAimGo to manage subscription status.

## Overview

FemiLeasing is an active ReadyAimGo C-Suite client. The integration allows ReadyAimGo to:
- Check FemiLeasing subscription status
- Receive notifications when subscription status changes
- Update subscription status from ReadyAimGo's side

## API Endpoints

### 1. Check Subscription Status

**Endpoint:** `GET /api/readyaimgo/subscription-status`

**Description:** Public API endpoint for ReadyAimGo to check FemiLeasing subscription status.

**Authentication:** Optional API key via `X-API-Key` header or `Authorization: Bearer <key>` header.

**Response:**
```json
{
  "client_id": "femileasing",
  "active": true,
  "status": "active",
  "plan": "c-suite",
  "last_payment": {
    "amount": 300,
    "currency": "usd",
    "date": "2024-11-28T08:26:00Z",
    "payment_intent_id": "pi_xxx"
  },
  "next_payment_due": "2024-12-28T08:26:00Z",
  "created_at": "2024-11-28T08:26:00Z",
  "updated_at": "2024-11-28T08:26:00Z",
  "metadata": {}
}
```

**Usage Example:**
```bash
curl -X GET https://femileasing.com/api/readyaimgo/subscription-status \
  -H "X-API-Key: your-api-key"
```

### 2. Update Subscription Status (Webhook)

**Endpoint:** `POST /api/readyaimgo/subscription-status`

**Description:** Allows ReadyAimGo to push subscription updates to FemiLeasing.

**Authentication:** Required API key via `X-API-Key` header or `Authorization: Bearer <key>` header.

**Request Body:**
```json
{
  "status": "active",
  "active": true,
  "plan": "c-suite",
  "last_payment": {
    "amount": 300,
    "currency": "usd",
    "date": "2024-11-28T08:26:00Z",
    "payment_intent_id": "pi_xxx"
  },
  "next_payment_due": "2024-12-28T08:26:00Z",
  "metadata": {}
}
```

**Usage Example:**
```bash
curl -X POST https://femileasing.com/api/readyaimgo/subscription-status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "status": "active",
    "active": true,
    "plan": "c-suite"
  }'
```

## Webhook Notifications

FemiLeasing automatically sends webhook notifications to ReadyAimGo when subscription status changes.

**Webhook URL:** Configured via `READYAIMGO_WEBHOOK_URL` environment variable (default: `https://readyaimgo.biz/api/webhooks/femileasing`)

**Webhook Payload:**
```json
{
  "client_id": "femileasing",
  "active": true,
  "status": "active",
  "plan": "c-suite",
  "last_payment": {
    "amount": 300,
    "currency": "usd",
    "date": "2024-11-28T08:26:00Z",
    "payment_intent_id": "pi_xxx"
  },
  "next_payment_due": "2024-12-28T08:26:00Z",
  "metadata": {}
}
```

**When Webhooks Are Sent:**
- When a subscription payment is detected
- When subscription status changes (active/inactive)
- When subscription is manually updated

## Environment Variables

Add these to your `.env.local`:

```env
# ReadyAimGo Integration
READYAIMGO_WEBHOOK_URL=https://readyaimgo.biz/api/webhooks/femileasing
READYAIMGO_API_KEY=your-shared-api-key-here
```

## Subscription Status Flow

1. **Payment Detection:**
   - FemiLeasing detects subscription payment via Stripe webhook
   - Payment is stored in Firestore `subscriptions` collection
   - Subscription status is updated to `active`

2. **Webhook Notification:**
   - FemiLeasing sends webhook to ReadyAimGo
   - ReadyAimGo receives notification and updates their records

3. **Status Verification:**
   - ReadyAimGo can call `/api/readyaimgo/subscription-status` to verify status
   - FemiLeasing returns current subscription status

4. **Manual Updates:**
   - ReadyAimGo can push updates via `POST /api/readyaimgo/subscription-status`
   - Updates are stored in Firestore and reflected immediately

## Firestore Structure

Subscription data is stored in Firestore:

**Collection:** `subscriptions`
**Document ID:** `femileasing`

**Document Structure:**
```json
{
  "client_id": "femileasing",
  "active": true,
  "status": "active",
  "plan": "c-suite",
  "last_payment": {
    "amount": 300,
    "currency": "usd",
    "date": "2024-11-28T08:26:00Z",
    "payment_intent_id": "pi_xxx"
  },
  "next_payment_due": "2024-12-28T08:26:00Z",
  "metadata": {},
  "created_at": "2024-11-28T08:26:00Z",
  "updated_at": "2024-11-28T08:26:00Z",
  "updated_by": "femileasing"
}
```

## Testing

### Test Subscription Status Check:
```bash
curl http://localhost:3000/api/readyaimgo/subscription-status
```

### Test Subscription Update:
```bash
curl -X POST http://localhost:3000/api/readyaimgo/subscription-status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"status": "active", "active": true}'
```

## Security

- API key authentication is optional but recommended
- Webhook URLs should use HTTPS in production
- API keys should be kept secret and rotated regularly
- Consider implementing webhook signature verification for additional security

## Troubleshooting

**Webhook Not Sending:**
- Check `READYAIMGO_WEBHOOK_URL` is set correctly
- Verify network connectivity between servers
- Check server logs for webhook errors

**Subscription Status Not Updating:**
- Verify Firestore is initialized correctly
- Check subscription payment detection logic
- Review Stripe webhook configuration

**API Authentication Failing:**
- Verify `READYAIMGO_API_KEY` matches on both sides
- Check API key is being sent in correct header format
- Review authentication middleware

