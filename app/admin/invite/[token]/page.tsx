"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invitation link')
      return
    }

    const acceptInvite = async () => {
      // First, verify the invitation token is valid (without requiring auth)
      try {
        const verifyResponse = await fetch(`/api/admin/invite?token=${token}`)
        const verifyData = await verifyResponse.json()
        
        if (!verifyResponse.ok || !verifyData.valid) {
          setStatus('error')
          setMessage(verifyData.error || 'Invalid or expired invitation')
          return
        }

        // If user is not signed in, prompt them to sign in
        if (!user) {
          setStatus('error')
          setMessage(`Please sign in with Google using the email: ${verifyData.email}`)
          setTimeout(() => {
            router.push(`/admin/login?invite=${token}`)
          }, 2000)
          return
        }

        // Verify the signed-in user's email matches the invitation
        if (user.email?.toLowerCase() !== verifyData.email.toLowerCase()) {
          setStatus('error')
          setMessage(`This invitation is for ${verifyData.email}. Please sign in with that email address.`)
          setTimeout(() => {
            router.push(`/admin/login?invite=${token}`)
          }, 3000)
          return
        }

        // User is signed in and email matches, accept the invitation
        const idToken = await user.getIdToken()
        const response = await fetch('/api/admin/invite/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Invitation accepted! You now have admin access.')
          setTimeout(() => {
            router.push('/admin/dashboard')
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Failed to accept invitation')
        }
      } catch (err) {
        setStatus('error')
        setMessage('An error occurred. Please try again.')
      }
    }

    acceptInvite()
  }, [token, user, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-yellow-600" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Processing Invitation</h1>
            <p className="text-gray-600">{message || 'Please wait...'}</p>
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
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => router.push('/admin/login')} className="bg-yellow-500 hover:bg-yellow-600">
              Go to Login
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

