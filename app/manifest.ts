import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Calyx Medical Prototype',
    short_name: 'Calyx',
    description: 'A live technical demonstration of compliant healthcare infrastructure. Calyx Medical features FHIR-based prescription triage, a GDP-compliant B2B pharmacy procurement and manifest checkout system, and an audit-ready immutable ledger. Purpose-built for businesses requiring strict cryptographic traceability, data privacy, and technical auditability.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f7f4',
    theme_color: '#1363d3',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-310x310.png',
        sizes: '310x310',
        type: 'image/png',
      },
      {
        src: '/icon-maskable-310x310.png',
        sizes: '310x310',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}