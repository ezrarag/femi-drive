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
      
      // Check if this is a popup window (for checkout modal)
      const userAgent = request.headers.get('user-agent') || ''
      const isPopup = userAgent.includes('popup') || requestUrl.searchParams.get('popup') === 'true'
      
      if (isPopup) {
        // For popup windows, show a success page that will close itself
        return new NextResponse(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Successful</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: #f0f9ff;
                }
                .success { 
                  color: #059669; 
                  font-size: 24px; 
                  margin-bottom: 20px;
                }
                .message { 
                  color: #374151; 
                  margin-bottom: 30px;
                }
                .close-btn { 
                  background: #3b82f6; 
                  color: white; 
                  padding: 12px 24px; 
                  border: none; 
                  border-radius: 6px; 
                  cursor: pointer;
                }
              </style>
            </head>
            <body>
              <div class="success">✅ Authentication Successful!</div>
              <div class="message">You can now close this window and continue with your booking.</div>
              <button class="close-btn" onclick="window.close()">Close Window</button>
              <script>
                // Auto-close after 3 seconds
                setTimeout(() => window.close(), 3000);
              </script>
            </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        })
      }
      
      // For regular redirects, go to inventory page
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
