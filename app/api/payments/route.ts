import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { adminAuth } from '@/lib/firebase-admin'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    })
  : null

export async function GET(request: NextRequest) {
  try {
    // Get the authorization token from the request
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized. Missing or invalid authorization header.' },
        { status: 401 }
      )
    }

    const idToken = authHeader.replace('Bearer ', '')

    // Verify the Firebase ID token
    let decodedToken
    try {
      if (!adminAuth) {
        console.error('Firebase Admin Auth not initialized')
        return NextResponse.json(
          { error: 'Server configuration error. Firebase Admin not initialized.' },
          { status: 500 }
        )
      }
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch (error: any) {
      console.error('Token verification error:', error)
      return NextResponse.json(
        { error: 'Unauthorized. Invalid token.', details: error.message },
        { status: 401 }
      )
    }

    const userEmail = decodedToken.email
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in token.' },
        { status: 400 }
      )
    }

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured.' },
        { status: 500 }
      )
    }

    console.log(`🔍 Searching for payments for user: ${userEmail}`)
    
    // Try to search for payments using Stripe's search API
    // First, try searching by email in metadata and receipt_email
    let userPayments: Stripe.PaymentIntent[] = []
    let searchMethod = 'unknown'
    
    try {
      // Search for payments with the user's email in metadata or receipt_email
      // Stripe search syntax: field:'value' for exact matches
      const searchQueries = [
        `metadata['customer_email']:'${userEmail}'`,
        `metadata['customerEmail']:'${userEmail}'`,
        `metadata['investor_email']:'${userEmail}'`,
        `receipt_email:'${userEmail}'`
      ]
      
      // Try each search query and combine results
      const allResults: Stripe.PaymentIntent[] = []
      const seenIds = new Set<string>()
      
      for (const query of searchQueries) {
        try {
          const searchResults = await stripe.paymentIntents.search({
            query,
            limit: 100,
          })
          
          console.log(`✅ Search query "${query}" returned ${searchResults.data.length} results`)
          
          // Add unique results
          for (const pi of searchResults.data) {
            if (!seenIds.has(pi.id)) {
              allResults.push(pi)
              seenIds.add(pi.id)
            }
          }
        } catch (queryError: any) {
          // Continue to next query if one fails
          console.log(`❌ Search query failed: ${query}`, queryError?.message || queryError)
        }
      }
      
      if (allResults.length > 0) {
        userPayments = allResults
        searchMethod = 'search_api'
        console.log(`✅ Found ${userPayments.length} payments via search API`)
      }
    } catch (searchError) {
      console.log('⚠️ Search API not available or failed, falling back to list:', searchError)
    }

    // If search didn't find anything, fetch ALL payments and filter
    // This ensures we get older payments that might not have been indexed
    if (userPayments.length === 0) {
      console.log('📋 Fetching all payments via list API (this may take a moment)...')
      searchMethod = 'list_all'
      
      // Fetch payments in batches to get all of them
      let allPaymentIntents: Stripe.PaymentIntent[] = []
      let hasMore = true
      let startingAfter: string | undefined = undefined
      const maxPayments = 1000 // Limit to prevent timeout, but get a lot
      
      while (hasMore && allPaymentIntents.length < maxPayments) {
        const params: Stripe.PaymentIntentListParams = {
          limit: 100, // Stripe max per page
        }
        
        if (startingAfter) {
          params.starting_after = startingAfter
        }
        
        const paymentIntents = await stripe.paymentIntents.list(params)
        
        allPaymentIntents = allPaymentIntents.concat(paymentIntents.data)
        console.log(`📦 Fetched ${paymentIntents.data.length} payments (total: ${allPaymentIntents.length})`)
        
        hasMore = paymentIntents.has_more
        if (paymentIntents.data.length > 0) {
          startingAfter = paymentIntents.data[paymentIntents.data.length - 1].id
        }
      }

      console.log(`📊 Total payments fetched: ${allPaymentIntents.length}`)
      console.log(`🔍 Filtering by email: ${userEmail}`)

      // Filter payments that match the user's email
      userPayments = allPaymentIntents.filter((pi) => {
        // Check if payment has receipt_email matching user
        if (pi.receipt_email && pi.receipt_email.toLowerCase() === userEmail.toLowerCase()) {
          return true
        }
        // Check metadata for email matches (try all possible field names)
        const metadataEmail = pi.metadata?.customer_email || 
                              pi.metadata?.customerEmail || 
                              pi.metadata?.investor_email ||
                              pi.metadata?.email
        if (metadataEmail && metadataEmail.toLowerCase() === userEmail.toLowerCase()) {
          return true
        }
        return false
      })
      
      console.log(`✅ Found ${userPayments.length} payments matching email after filtering`)
      
      // Debug: log a sample of payments that don't match to help debug
      if (userPayments.length === 0 && allPaymentIntents.length > 0) {
        console.log('🔍 Sample of payments (first 5) for debugging:')
        allPaymentIntents.slice(0, 5).forEach((pi, idx) => {
          console.log(`  Payment ${idx + 1}:`, {
            id: pi.id,
            receipt_email: pi.receipt_email,
            metadata: pi.metadata,
            description: pi.description,
            created: new Date(pi.created * 1000).toISOString()
          })
        })
      }
    }

    // Format payments for the frontend
    const formattedPayments = userPayments.map((pi) => ({
      id: pi.id,
      amount: pi.amount / 100, // Convert from cents to dollars
      currency: pi.currency,
      status: pi.status,
      description: pi.description || 'Payment',
      type: pi.metadata?.type || 'unknown',
      created: new Date(pi.created * 1000).toISOString(),
      metadata: pi.metadata,
      receiptUrl: pi.charges?.data[0]?.receipt_url || null,
    }))

    // Sort by most recent first
    formattedPayments.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

    console.log(`✅ Returning ${formattedPayments.length} formatted payments (method: ${searchMethod})`)

    return NextResponse.json({ 
      payments: formattedPayments,
      debug: {
        searchMethod,
        userEmail,
        totalFound: formattedPayments.length
      }
    })
  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments', message: error.message },
      { status: 500 }
    )
  }
}

