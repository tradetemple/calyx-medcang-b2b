import { MedicalProduct, Specification } from '@/types/medical-product';

const FLOWER_IMAGES = [
  '/images/strains/flower-1.webp',
  '/images/strains/flower-2.webp',
  '/images/strains/flower-3.webp',
  '/images/strains/flower-4.webp'
];

// Simple seeded random number generator to ensure deterministic mock data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const generateFutureExpiryDate = (seed: number) => {
  // Current context: May 19, 2026
  const start = new Date(2026, 4, 20).getTime(); // May 20, 2026
  const end = new Date(2027, 11, 31).getTime(); // Dec 31, 2027
  const randomTime = start + seededRandom(seed) * (end - start);
  return new Date(randomTime).toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

const BRANDS = ['IUVO', 'Demecan', 'Four20 Pharma', 'Cannamedical', 'Bloomwell', 'Cantourage', 'Sanity Group'];
const STRAIN_NAMES = ['Ice Cream Cake', 'Kush Mints', 'Blue Cheese', 'Zkittlez', 'Pink Runtz', 'Zangria', 'Permanent Marker', 'RS11', 'Cereal Milk'];
const TERPENES = ['Myrcene', 'Limonene', 'Caryophyllene', 'Linalool', 'Pinene', 'Terpinolene', 'Humulene'];
const ORIGINS = ['Germany', 'Canada', 'Portugal', 'Denmark', 'Netherlands', 'Macedonia'];

/**
 * Abbreviates strain names (e.g., "Ice Cream Cake" -> "ICC")
 */
const abbreviateStrain = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

export const generateMockProducts = (count: number): MedicalProduct[] => {
  const products: MedicalProduct[] = [];

  for (let i = 1; i <= count; i++) {
    const brand = BRANDS[i % BRANDS.length];
    const strain = STRAIN_NAMES[i % STRAIN_NAMES.length];
    
    // Use i as a seed for different properties to ensure consistency
    const seed = i * 1337; 
    
    // 1. SELECT PRODUCT TYPE (Ratios)
    // We simulate 3 types: THC-Dominant (1:30), Balanced (1:1), CBD-Dominant (20:1)
    const typeRoll = seededRandom(seed + 1);
    let thc: number, cbd: number, ratio: string;
    
    if (typeRoll > 0.4) { // THC Dominant
      thc = Math.floor(seededRandom(seed + 2) * (30 - 18 + 1) + 18);
      cbd = parseFloat((seededRandom(seed + 3) * 1).toFixed(1));
      ratio = `${thc}:1`;
    } else if (typeRoll > 0.15) { // Balanced
      thc = Math.floor(seededRandom(seed + 4) * (10 - 5 + 1) + 5);
      cbd = Math.floor(seededRandom(seed + 5) * (12 - 7 + 1) + 7);
      ratio = '1:1';
    } else { // CBD Dominant
      thc = parseFloat((seededRandom(seed + 6) * 1).toFixed(1));
      cbd = Math.floor(seededRandom(seed + 7) * (20 - 10 + 1) + 10);
      ratio = `1:${cbd}`;
    }

    // 2. LOGISTICS & COMPLIANCE DATA
    const isIrradiated = seededRandom(seed + 8) > 0.5;
    const terpenePercentage = (seededRandom(seed + 9) * (4.5 - 1.2) + 1.2).toFixed(2);
    
    // Deterministic shuffle for terpenes
    const topTerps = [...TERPENES]
      .map(t => ({ t, sort: seededRandom(seed + 10 + TERPENES.indexOf(t)) }))
      .sort((a, b) => a.sort - b.sort)
      .slice(0, 3)
      .map(item => item.t)
      .join(', ');

    const moisture = (seededRandom(seed + 20) * (12 - 8) + 8).toFixed(1);
    const pricePerKg = Math.floor(seededRandom(seed + 21) * (5000 - 2200 + 1) + 2200);
    const baseGramPrice = parseFloat((pricePerKg / 1000).toFixed(2));
    const image = FLOWER_IMAGES[i % FLOWER_IMAGES.length];
    const slug = `${brand.toLowerCase().replace(/\s/g, '-')}-${strain.toLowerCase().replace(/\s/g, '-')}-${thc}-${cbd}`;

    // 3. CONSTRUCT DEEP COMPLIANCE SPECIFICATIONS (Specification[])
    // This format is what your accordion expects
    const specs: Specification[] = [
      { name: 'Genotype', value: i % 3 === 0 ? 'Indica' : i % 3 === 1 ? 'Sativa' : 'Hybrid' },
      { name: 'THC Content', value: `${thc}%` },
      { name: 'CBD Content', value: `${cbd}%` },
      { name: 'THC:CBD Ratio', value: ratio },
      { name: 'Total Terpenes', value: `${terpenePercentage}%` },
      { name: 'Dominant Terpenes', value: topTerps },
      { name: 'Irradiation', value: isIrradiated ? 'Gamma-Irradiated' : 'Non-Irradiated' },
      { name: 'Cultivation', value: i % 2 === 0 ? 'Indoor / Hydroponic' : 'Greenhouse / Living Soil' },
      { name: 'Origin', value: ORIGINS[i % ORIGINS.length] },
      { name: 'Residual Moisture', value: `${moisture}%` },
      { name: 'GACP/GMP Status', value: 'Certified Pharmaceutical Grade' }
    ];

    const abbreviation = abbreviateStrain(strain);

    products.push({
      id: `med-${i.toString().padStart(3, '0')}`,
      name: `${brand} ${abbreviation} ${ratio}`,
      descriptive_name: `${strain} ${thc}/${cbd}`,
      slug: slug,
      displaySlug: slug,
      description: `Pharmaceutical grade medical cannabis flower. Batch tested for heavy metals, pesticides, and microbial purity.`,
      detailed_desc: `A high-stability cultivar characterized by its specific ${ratio} cannabinoid profile. This batch (${thc}% THC) is optimized for clinical consistency. Dominant terpenes: ${topTerps}.`,
      price_per_kg: pricePerKg,
      kg_price: true,
      product_image: image,
      category: "Flower",
      status: i % 15 === 0 ? 'out_of_stock' : 'active',
      moq_grams: 50,
      live_stock_grams: Math.floor(seededRandom(seed + 22) * 25000) + 500,
      is_featured: i <= 5,
      
      // Tiered B2B Pricing Matrix
      price_chart: {
        tiers:[
          { min: 50, price: baseGramPrice + 0.50 },
          { min: 250, price: baseGramPrice + 0.10 },
          { min: 500, price: baseGramPrice - 0.20 }
        ]
      },

      // INJECTED SPECIFICATIONS
      specifications: specs,

      test_results: {
        batch_number: `DE-BTM-${2026}-${i.toString().padStart(4, '0')}`,
        expiry_date: generateFutureExpiryDate(seed + 23),
        lab_analysis: "Eurofins / Ph. Eur. Compliant",
        coa_url: "/docs/sample-coa.pdf" 
      },
      
      translations: [
        {
          locale: 'de',
          name: `${brand} ${strain}`,
          descriptive_name: `${thc}/${cbd} - ${isIrradiated ? 'Bestrahlt' : 'Unbestrahlt'}`,
          description: `Medizinisches Cannabis in pharmazeutischer Qualität. Chargengeprüft auf Schwermetalle und Pestizide.`,
        }
      ],
      
      categories: [
        { category_id: "cat-flower", is_primary: true, category: { id: "cat-flower", name: "Flower", slug: "flower" } }
      ]
    });
  }

  return products;
};

export const mockProducts = generateMockProducts(50);
