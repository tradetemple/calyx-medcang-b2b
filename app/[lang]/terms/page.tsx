import { ReactNode } from 'react';
import { getDictionary } from '@/app/[lang]/dictionaries';

export const dynamic = 'force-static';

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const t = dict.terms;

  const termsSections: Record<string, { list?: string[] }> =
    typeof dict.terms === 'object' && dict.terms !== null && 'sections' in dict.terms
      ? ((dict.terms as unknown) as { sections: Record<string, { list?: string[] }> }).sections
      : {};

  // Define sections for navigation
  const sections = [
    { id: 'section1', title: t.sections.section1.title },
    { id: 'section2', title: t.sections.section2.title },
    { id: 'section3', title: t.sections.section3.title },
    { id: 'section4', title: t.sections.section4.title },
    { id: 'section5', title: t.sections.section5.title },
    { id: 'section6', title: t.sections.section6.title },
    { id: 'section7', title: t.sections.section7.title }
  ];

  function renderPara(sectionId: string, paraNum: number) {
    const key = `sections.${sectionId}.para${paraNum}`;
    let value: ReactNode;
    try {
      value = (t.sections as any)[sectionId][`para${paraNum}`];
    } catch {
      return null;
    }
    if (typeof value === 'string' && value.startsWith('sections.')) return null;
    return (
      <p
        className="mb-4 text-text-main"
        dangerouslySetInnerHTML={{ __html: value as string }}
      />
    );
  }

  function renderList(sectionId: string) {
    const key = `sections.${sectionId}.list`;
    const items = termsSections[sectionId]?.list;
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <ul className="list-disc pl-6 space-y-2 text-text-secondary">
        {items.map((_, idx) => (
          <li
            key={idx}
            dangerouslySetInnerHTML={{ __html: (t.sections as any)[sectionId].list[idx] }}
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-screen py-12">

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-static-black font-merriweather-main tracking-wide mb-4">{t.title}</h1>
          <p className="text-sm text-text-secondary uppercase tracking-wider">{t.subtitle}</p>
        </div>

        <div className="flex flex-col lg:!flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 sticky top-12">
              <h2 className="text-xl font-semibold text-static-black mb-4">
                {t.title}
              </h2>
              <nav>
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block w-full text-left px-3 py-2 rounded-none transition-colors text-text-secondary hover:bg-secondary/10 hover:text-secondary"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            <div className="space-y-8">
              <section id="section1" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section1.title}</h2>
                {renderPara('section1', 1)}
                {renderPara('section1', 2)}
                {renderPara('section1', 3)}
                {renderPara('section1', 4)}
              </section>

              <section id="section2" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section2.title}</h2>
                {renderPara('section2', 1)}
                {renderPara('section2', 2)}
                {renderList('section2')}
              </section>

              <section id="section3" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section3.title}</h2>
                {renderPara('section3', 1)}
                {renderPara('section3', 2)}
              </section>

              <section id="section4" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section4.title}</h2>
                {renderPara('section4', 1)}
                {renderPara('section4', 2)}
              </section>

              <section id="section5" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section5.title}</h2>
                {renderPara('section5', 1)}
                {renderPara('section5', 2)}
              </section>

              <section id="section6" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section6.title}</h2>
                {renderPara('section6', 1)}
                {renderPara('section6', 2)}
              </section>

              <section id="section7" className="bg-primary/10 rounded-none border-2 border-primary/20 p-6 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-static-black mb-4">{t.sections.section7.title}</h2>
                {renderPara('section7', 1)}
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
