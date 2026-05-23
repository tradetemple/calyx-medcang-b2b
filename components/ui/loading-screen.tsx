import { getDictionary } from '@/app/[lang]/dictionaries'

interface LoadingScreenProps {
  lang: string;
}

export default async function Loading({ lang }: LoadingScreenProps) {
    const dict = await getDictionary(lang)

    return (
        <div className="grid min-h-screen w-full place-items-center animate-pulse font-semibold uppercase tracking-wider text-text-secondary">
            {dict.loading}
        </div>
    )
}
