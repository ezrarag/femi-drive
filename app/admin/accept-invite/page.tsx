"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { user, signIn } = useAuth()
  const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [inviteEmail, setInviteEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link. No token provided.')
      return
    }

    const processInvite = async () => {
      try {
        // Step 1: Verify the invitation token (no auth required)
        setStatus('verifying')
        const verifyResponse = await fetch(`/api/admin/invite?token=${token}`)
        const verifyData = await verifyResponse.json()
        
        if (!verifyResponse.ok || !verifyData.valid) {
          setStatus('error')
          setMessage(verifyData.error || 'Invalid or expired invitation')
          return
        }

        setInviteEmail(verifyData.email)

        // Step 2: Check if user is signed in
        if (!user) {
          setStatus('error')
          setMessage(`Please sign in with Google using the email: ${verifyData.email}`)
          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            router.push(`/admin/login?invite=${token}`)
          }, 3000)
          return
        }

        // Step 3: Verify the signed-in user's email matches the invitation
        if (user.email?.toLowerCase() !== verifyData.email.toLowerCase()) {
          setStatus('error')
          setMessage(`This invitation is for ${verifyData.email}. You are signed in as ${user.email}. Please sign out and sign in with the correct email address.`)
          setTimeout(() => {
            router.push(`/admin/login?invite=${token}`)
          }, 5000)
          return
        }

        // Step 4: User is signed in and email matches, accept the invitation
        setStatus('verifying')
        const idToken = await user.getIdToken()
        const acceptResponse = await fetch('/api/admin/invite/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token }),
        })

        const acceptData = await acceptResponse.json()

        if (acceptResponse.ok && acceptData.success) {
          setStatus('success')
          setMessage(acceptData.message || 'Invitation accepted! You now have admin access.')
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(acceptData.error || 'Failed to accept invitation. Please try again.')
        }
      } catch (err: any) {
        console.error('Error processing invitation:', err)
        setStatus('error')
        setMessage(err.message || 'An error occurred. Please try again.')
      }
    }

    processInvite()
  }, [token, user, router])

  const handleSignIn = () => {
    if (token) {
      router.push(`/admin/login?invite=${token}`)
    } else {
      router.push('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-yellow-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Loading Invitation</h1>
            <p className="text-gray-600">Please wait...</p>
          </>
        )}

        {status === 'verifying' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-yellow-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Processing Invitation</h1>
            <p className="text-gray-600">{message || 'Verifying your invitation...'}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Accepted!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to admin dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            {inviteEmail && !user && (
              <Button 
                onClick={handleSignIn} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white w-full"
              >
                Sign In with Google
              </Button>
            )}
            {!inviteEmail && (
              <Button 
                onClick={() => router.push('/admin/login')} 
                className="bg-yellow-500 hover:bg-yellow-600 text-white w-full"
              >
                Go to Login
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

