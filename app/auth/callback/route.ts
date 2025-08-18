import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('Auth callback received:', { code: !!code, error, errorDescription, url: request.url })

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    try {
      console.log('Exchanging code for session...')
      const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Session exchange error:', exchangeError)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`
        )
      }

      console.log('Session exchange successful, user:', data.user?.email)
      
      // Successful authentication - redirect to inventory page where user was trying to book
      return NextResponse.redirect(`${requestUrl.origin}/inventory`)
    } catch (err) {
      console.error('Unexpected error during auth callback:', err)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`
      )
    }
  }

  // No code or error - redirect to login
  console.log('No code or error found, redirecting to login')
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
