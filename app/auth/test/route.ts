import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Log all query parameters and headers for debugging
  const queryParams = Object.fromEntries(requestUrl.searchParams.entries())
  const headers = Object.fromEntries(request.headers.entries())
  
  console.log('Test route accessed with:')
  console.log('URL:', request.url)
  console.log('Query params:', queryParams)
  console.log('Headers:', headers)
  
  return NextResponse.json({
    message: 'Test route accessed',
    url: request.url,
    queryParams,
    headers: Object.keys(headers),
    timestamp: new Date().toISOString()
  })
}
