import { getDictionary } from '@/app/[lang]/dictionaries';

export const dynamic = 'force-static'

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const t = dict.privacy;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <div className="space-y-8 text-text-main font-body">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-static-black font-merriweather-main mb-4 tracking-wide">
            {t.hero.title}
          </h1>
          <p className="text-sm text-text-secondary uppercase tracking-wider">
            {t.hero.subtitle}
          </p>
        </div>

        <section className="bg-primary/10 p-6 rounded-none border-2 border-primary/20">
          <h2 className="text-xl font-semibold text-static-black uppercase tracking-wider mb-4">
            {t.sections.dataCollection.title}
          </h2>
          <p className="mb-4">
            {t.sections.dataCollection.intro}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-secondary">
            {t.sections.dataCollection.items.map((item: string, index: number) => (
              <li key={`dc-${index}-${item.substring(0, 20)}`}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-primary/10 p-6 rounded-none border-2 border-primary/20">
          <h2 className="text-xl font-semibold text-static-black uppercase tracking-wider mb-4">
            {t.sections.dataSecurity.title}
          </h2>
          <p className="mb-4">
            {t.sections.dataSecurity.description}
          </p>
        </section>

        <section className="bg-primary/10 p-6 rounded-none border-2 border-primary/20">
          <h2 className="text-xl font-semibold text-static-black uppercase tracking-wider mb-4">
            {t.sections.rights.title}
          </h2>
          <p className="mb-4">
            {t.sections.rights.intro}
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-secondary">
            {t.sections.rights.items.map((item: string, index: number) => (
              <li key={`rights-${index}-${item.substring(0, 20)}`}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
