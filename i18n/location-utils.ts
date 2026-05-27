import { getDictionary } from '@/app/[lang]/dictionaries';

export async function getLocaleLocationData(locale: string) {
  try {

    const dict = await getDictionary(locale);

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

    const formattedCities = formatCitiesList(cities);

    return {
      cities,
      formattedCities,
      mainCity: cities[0],
      country,
      area
    };
  } catch {
    return {
      cities: ['London', 'Manchester', 'Birmingham'],
      formattedCities: 'London, Manchester, and Birmingham',
      mainCity: 'London',
      country: 'United Kingdom',
      area: 'Europe'
    };
  }
}

function formatCitiesList(cities: string[]): string {
  if (cities.length === 0) return '';
  const limitedCities = cities.slice(0, 4);
  return limitedCities.join(', ');
}

export function getCountryGeoCoordinates(country: string): { latitude: number; longitude: number } {
  const coordinatesMap: Record<string, { latitude: number; longitude: number }> = {
    'United Kingdom': { latitude: 55.3781, longitude: -3.4360 },
    'Germany': { latitude: 51.1657, longitude: 10.4515 }
  };

  return coordinatesMap[country] || { latitude: 0, longitude: 0 };
}
