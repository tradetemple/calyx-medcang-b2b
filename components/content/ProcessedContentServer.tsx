import { getProductSlugsForContent } from '@/lib/optimized-products'
import i18nConfig from '@/i18n/config'
import ProcessedContent from './ProcessedContent'

interface ProcessedContentServerProps {
  htmlContent: string
  lang: string
  className?: string
}

export default async function ProcessedContentServer({ htmlContent, lang, className }: ProcessedContentServerProps) {
  let processedContent = htmlContent

  const productLinkRegex = /<a href="product-link:\/\/([a-f0-9-]+)">(.*?)<\/a>/g;
  const productIdsToFetch: Set<string> = new Set();
  let productMatch;

  while ((productMatch = productLinkRegex.exec(htmlContent)) !== null) {
    productIdsToFetch.add(productMatch[1]);
  }

  if (productIdsToFetch.size > 0) {
    const productSlugMap = await getProductSlugsForContent(Array.from(productIdsToFetch), lang);

    let productsPath = '/products';
    try {
      const pathnames = i18nConfig.pathnames;
      const productsPathPattern = '/products/[slug]';
      const productDetailPathMap = pathnames[productsPathPattern] as Record<string, string>;

      if (productDetailPathMap && productDetailPathMap[lang]) {
        const basePath = productDetailPathMap[lang].replace('[slug]', '');
        productsPath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
      }
    } catch (e) {
      console.error('Error accessing translated path for products:', e);
    }

    processedContent = processedContent.replace(productLinkRegex, (fullMatch, productId, linkText) => {
      const localizedSlug = productSlugMap.get(productId);
      if (localizedSlug) {
        const productUrl = `/${lang}${productsPath}/${localizedSlug}`;
        return `<a href="${productUrl}">${linkText}</a>`;
      }
      console.warn(`Product with ID ${productId} not found or slug not available for locale ${lang}.`);
      return `<a href="#">${linkText}</a>`;
    });
  }

  processedContent = processedContent.replace(
    /<video-placeholder src="([^"]+)"([^>]*)><\/video-placeholder>/g,
    (match, src, attributes) => {
      const posterMatch = attributes.match(/poster="([^"]+)"/)
      const altMatch = attributes.match(/alt="([^"]+)"/)
      const autoplayMatch = attributes.match(/autoplay="([^"]+)"/)
      const mutedMatch = attributes.match(/muted="([^"]+)"/)
      const loopMatch = attributes.match(/loop="([^"]+)"/)
      const controlsMatch = attributes.match(/controls="([^"]+)"/)

      const poster = posterMatch ? ` poster="${posterMatch[1]}"` : ''
      const alt = altMatch ? ` aria-label="${altMatch[1]}"` : ' aria-label="Video content"'
      const autoPlay = autoplayMatch && autoplayMatch[1] === 'true' ? ' autoplay' : ''
      const muted = mutedMatch && mutedMatch[1] === 'true' ? ' muted' : ' muted'
      const loop = loopMatch && loopMatch[1] === 'true' ? ' loop' : ''
      const controls = controlsMatch && controlsMatch[1] === 'true' ? ' controls' : ' controls'

      return `<video src="${src}"${poster}${alt}${controls}${muted}${autoPlay}${loop} class="w-full h-auto rounded-lg shadow-lg video-with-preview" preload="metadata" playsinline></video>`
    }
  )

  processedContent = processedContent.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>')

  return <ProcessedContent htmlContent={processedContent} className={className} />
}
