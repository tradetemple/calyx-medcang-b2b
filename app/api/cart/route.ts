import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getCorsHeaders } from '@/lib/api-protection'



export async function POST(request: NextRequest) {
  const rateLimiter = rateLimit(25, 60000);
  const rateResult = rateLimiter(request);
  
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: getCorsHeaders(origin) }
    );
  }

  
  try {
    const { guestId } = await request.json()
    
    return NextResponse.json({ success: true, guest: true, guestId })
    
  } catch (error) {
    console.error('Error syncing cart:', error)
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
  }
}
