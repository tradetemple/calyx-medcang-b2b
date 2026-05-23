/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getProductsForListView, getProductDataForCheckout } from '@/lib/optimized-products'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '50')
    const ids = searchParams.get('ids')?.split(',').filter(Boolean)

    let products: any[]

    // Use appropriate cached function based on whether IDs are provided
    if (ids && ids.length > 0) {
      // For specific IDs, use checkout function (it's designed for this)
      products = await getProductDataForCheckout(ids)
    } else {
      // For general listing, use list view function
      products = await getProductsForListView(locale, limit)
    }

    return NextResponse.json({ 
      products,
      count: products.length 
    })

  } catch (error) {
    console.error('Error in products API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}