import { NextRequest, NextResponse } from 'next/server';
import { getProductsForListView } from '@/lib/optimized-products';
import { enhanceProducts } from '@/lib/product-enhancement';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // getProductsForListView uses KV Cache and memory caching internally
    // It is highly optimized and caches results for 7 days
    const products = await getProductsForListView(locale, 1000);

    // Enhance the products so they are ready for the ProductGrid component
    const enhancedProducts = await enhanceProducts(products as any, locale);

    // We return all products so the client can search/filter instantly.
    return NextResponse.json({ 
      products: enhancedProducts
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Error in products search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
