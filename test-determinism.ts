import { generateMockProducts } from './lib/mock-data';

const runTest = () => {
  const products1 = generateMockProducts(10);
  const products2 = generateMockProducts(10);

  for (let i = 0; i < 10; i++) {
    if (products1[i].slug !== products2[i].slug) {
      console.error(`Mismatch at index ${i}: ${products1[i].slug} !== ${products2[i].slug}`);
      process.exit(1);
    }
    if (products1[i].price_per_kg !== products2[i].price_per_kg) {
      console.error(`Price mismatch at index ${i}`);
      process.exit(1);
    }
  }
  console.log('SUCCESS: Mock data is deterministic!');
};

runTest();
