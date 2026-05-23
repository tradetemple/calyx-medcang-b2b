import { unstable_cache } from 'next/cache';
import { getDictionary } from '../dictionaries';

// KV cache helper for region-level caching
interface KVNamespace {
  get(key: string, type: 'json' | 'text' | 'stream'): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

const getKV = () => {
  // OpenNext/Cloudflare binding
  return (process.env.NEXT_CACHE_WORKERS_KV as unknown as KVNamespace) || null;
};

const KV_TTL = 3600; // 1 hour in seconds

// Cache dictionary with KV
const getCachedDictionary = unstable_cache(
  async (lang: string) => {
    const kv = getKV();
    const cacheKey = `page-dictionary-${lang}`;

    if (kv) {
      try {
        const cached = await kv.get(cacheKey, 'json');
        if (cached) return cached;
      } catch (e) {
        console.error('KV Read Error:', e);
      }
    }

    const data = await getDictionary(lang);

    if (kv) {
      try {
        await kv.put(cacheKey, JSON.stringify(data), { expirationTtl: KV_TTL });
      } catch (e) {
        console.error('KV Write Error:', e);
      }
    }

    return data;
  },
  ['page-dictionary'],
  { revalidate: 3600, tags: ['dictionary'] }
);

// Home page data fetching
export const getHomeData = async (lang: string) => {
  const [dict] = await Promise.all([
    getCachedDictionary(lang),
  ]);

  return { dict };
};