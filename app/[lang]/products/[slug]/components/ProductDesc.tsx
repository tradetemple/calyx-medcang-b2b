import ProcessedContentServer from '@/components/content/ProcessedContentServer'; // Import the server wrapper

interface ProductDescriptionProps {
  description: string;
  lang: string; // Add lang prop
}

export default function ProductDescription({ description, lang }: ProductDescriptionProps) {
  return (
    <ProcessedContentServer
      htmlContent={description}
      lang={lang}
      className="prose prose-invert max-w-none text-text-secondary [&_strong]:font-bold prose-a:text-secondary prose-blockquote:text-text-secondary [&_strong]:text-text-main text-[0.8rem] md:text-base"
    />
  );
}
