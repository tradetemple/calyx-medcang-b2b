import ProcessedContentServer from '@/components/content/ProcessedContentServer'; 

interface ProductDescriptionProps {
  description: string;
  lang: string;
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
