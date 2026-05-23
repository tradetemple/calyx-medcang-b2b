import { NextRequest, NextResponse } from 'next/server';
import { getLocaleAndCurrencyFromCountry } from '@/lib/country-locale-mapping';

export async function GET(request: NextRequest) {
  try {
    // Try to get country from various headers
    const country = request.headers.get('x-vercel-ip-country') ||
                   request.headers.get('cf-ipcountry') ||
                   null;

    if (country) {
      const { locale, currency } = getLocaleAndCurrencyFromCountry(country);
      
      return NextResponse.json({
        country: country.toUpperCase(),
        locale,
        currency,
        source: 'ip_geolocation'
      });
    }

    return NextResponse.json({
      country: null,
      locale: 'en',
      currency: 'EUR',
      source: 'default'
    });
  } catch (error) {
    console.error('Country detection error:', error);
    
    return NextResponse.json({
      country: null,
      locale: 'en', 
      currency: 'EUR',
      source: 'error_fallback'
    }, { status: 200 }); // Return 200 to avoid client errors
  }
}