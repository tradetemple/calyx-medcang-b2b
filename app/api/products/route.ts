import { NextRequest, NextResponse } from 'next/server'
import { getProductsForListView, getProductDataForCheckout } from '@/lib/optimized-products'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '50')
    const ids = searchParams.get('ids')?.split(',').filter(Boolean)

    let products: any[]

    if (ids && ids.length > 0) {
      products = await getProductDataForCheckout(ids)
    } else {
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