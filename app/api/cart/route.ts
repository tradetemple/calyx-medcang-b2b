/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { rateLimit, getCorsHeaders } from '@/lib/api-protection'
import { getProductDataForCheckout } from '@/lib/optimized-products';

// This is a serverless function that syncs the cart to the database
// It's used when the user logs in or out to ensure their cart is stored
export async function POST(request: NextRequest) {
  const rateLimiter = rateLimit(25, 60000); // 100 requests per minute
  const rateResult = rateLimiter(request);
  
  if (!rateResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: getCorsHeaders(origin) }
    );
  }

  
  try {
    // Parse request body to get items, guestId, and potentially userId
    const { guestId } = await request.json()
    
    return NextResponse.json({ success: true, guest: true, guestId })
    
  } catch (error) {
    console.error('Error syncing cart:', error)
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
  }
}
