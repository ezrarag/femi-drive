/**
 * Send webhook notification to ReadyAimGo when subscription status changes
 * This allows readyaimgo.biz to be notified of subscription updates
 */

const READYAIMGO_WEBHOOK_URL = process.env.READYAIMGO_WEBHOOK_URL || 'https://readyaimgo.biz/api/webhooks/femileasing';
const READYAIMGO_API_KEY = process.env.READYAIMGO_API_KEY;

export interface SubscriptionUpdate {
  client_id: string;
  active: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  plan?: string;
  last_payment?: {
    amount: number;
    currency: string;
    date: string;
    payment_intent_id: string;
  };
  next_payment_due?: string;
  metadata?: Record<string, any>;
}

/**
 * Send subscription update to ReadyAimGo webhook endpoint
 */
export async function notifyReadyAimGo(update: SubscriptionUpdate): Promise<{ success: boolean; error?: string }> {
  if (!READYAIMGO_WEBHOOK_URL) {
    console.warn('ReadyAimGo webhook URL not configured, skipping notification');
    return { success: false, error: 'Webhook URL not configured' };
  }

  try {
    const response = await fetch(READYAIMGO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(READYAIMGO_API_KEY && { 'Authorization': `Bearer ${READYAIMGO_API_KEY}` }),
        ...(READYAIMGO_API_KEY && { 'X-API-Key': READYAIMGO_API_KEY }),
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ReadyAimGo webhook failed:', response.status, errorText);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }

    console.log('Successfully notified ReadyAimGo of subscription update');
    return { success: true };
  } catch (error: any) {
    console.error('Error sending webhook to ReadyAimGo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update subscription status and notify ReadyAimGo
 */
export async function updateSubscriptionStatus(
  active: boolean,
  status: 'active' | 'inactive' | 'suspended' | 'cancelled',
  lastPayment?: {
    amount: number;
    currency: string;
    date: string;
    payment_intent_id: string;
  },
  metadata?: Record<string, any>
): Promise<void> {
  const { adminFirestore } = await import('@/lib/firebase-admin');
  
  if (!adminFirestore) {
    console.error('Firestore not initialized, cannot update subscription');
    return;
  }

  const CLIENT_ID = 'femileasing';
  const SUBSCRIPTION_COLLECTION = 'subscriptions';

  // Update in Firestore
  await adminFirestore
    .collection(SUBSCRIPTION_COLLECTION)
    .doc(CLIENT_ID)
    .set({
      client_id: CLIENT_ID,
      active,
      status,
      last_payment: lastPayment || null,
      metadata: metadata || {},
      updated_at: new Date().toISOString(),
      updated_by: 'femileasing',
    }, { merge: true });

  // Notify ReadyAimGo
  await notifyReadyAimGo({
    client_id: CLIENT_ID,
    active,
    status,
    last_payment: lastPayment,
    metadata,
  });
}

