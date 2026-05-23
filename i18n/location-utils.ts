import { getDictionary } from '@/app/[lang]/dictionaries';

/**
 * Gets location data for a specific locale from the dictionary
 * Used for metadata generation to ensure consistency with translations
 */
export async function getLocaleLocationData(locale: string) {
  try {
    // Get the dictionary for the specified locale
    const dict = await getDictionary(locale);

    // Create locale-specific location data using translations
    // Default to English for missing translations
    let country;
    let cities = [];
    let area;

    switch (locale) {
      case 'en':
        country = dict.countries['United Kingdom'];
        cities = ['London', 'Manchester', 'Birmingham', 'Glasgow'];
        area = 'Europe';
        break;
      case 'de':
        country = dict.countries.Germany;
        cities = ['Berlin', 'München', 'Hamburg', 'Frankfurt'];
        area = 'Europa';
        break;
      default:
        country = dict.countries['United Kingdom'];
        cities = ['London', 'Manchester', 'Birmingham', 'Glasgow'];
        area = 'Europe';
    }

    // Format the cities for natural language display
    const formattedCities = formatCitiesList(cities);

    return {
      cities,
      formattedCities,
      mainCity: cities[0], // Primary city for the country
      country,
      area
    };
  } catch {
    // Fallback to default if translation fails
    return {
      cities: ['London', 'Manchester', 'Birmingham'],
      formattedCities: 'London, Manchester, and Birmingham',
      mainCity: 'London',
      country: 'United Kingdom',
      area: 'Europe'
    };
  }
}

/**
 * Formats a list of cities into a natural language string
 * e.g. ["London", "Manchester", "Birmingham", "Glasgow"] => "London, Manchester, Birmingham, Glasgow"
 */
function formatCitiesList(cities: string[]): string {
  if (cities.length === 0) return '';
  // Limit to a maximum of 4 cities as per user request
  const limitedCities = cities.slice(0, 4);
  return limitedCities.join(', ');
}

/**
 * Returns geo coordinates for a country
 * Used for schema.org GeoCoordinates
 */
export function getCountryGeoCoordinates(country: string): { latitude: number; longitude: number } {
  // Default coordinates map for supported countries
  const coordinatesMap: Record<string, { latitude: number; longitude: number }> = {
    'United Kingdom': { latitude: 55.3781, longitude: -3.4360 },
    'Germany': { latitude: 51.1657, longitude: 10.4515 }
  };

  return coordinatesMap[country] || { latitude: 0, longitude: 0 };
}
