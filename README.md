# Calyx Systems: B2B Procurement & Telemedical Triage Architecture

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3068b7?style=for-the-badge)](https://zod.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

An architectural demonstration of a MedCanG-compliant B2B medical infrastructure. Calyx Systems showcases FHIR-standardized telemedical triage, a GDP-compliant pharmacy procurement catalog, and an audit-ready immutable ledger. 

This repository demonstrates the application of Backend-For-Frontend (BFF) patterns and strict runtime validation in highly regulated pharmaceutical environments.

---

## Architectural Principles

The architecture prioritizes data integrity, regulatory enforcement, and zero-latency distribution through a serverless edge infrastructure.

### Edge-First Infrastructure
- **Cloudflare Pages & Workers:** The application utilizes OpenNext to deploy Next.js 15 directly to Cloudflare's Edge, bypassing traditional Node.js server bottlenecks.
- **Distributed State & Caching:**
    - **Workers KV:** Utilized for high-speed edge caching of configuration state and transient inventory data.
    - **R2 ISR (Incremental Static Regeneration):** Heavy assets and pre-rendered catalog pages are cached in R2 buckets, enabling instantaneous global distribution without triggering complete application rebuilds.
    - **Stale-While-Revalidate:** Implemented to guarantee high availability while cache invalidation resolves asynchronously.

### Strict Runtime Validation
- **Zod Data Boundaries:** `any` types are strictly prohibited. Zod is utilized as the absolute runtime boundary. All incoming payloads (FHIR ingestion, B2B cart mutations) are validated against schema definitions before hitting application logic, ensuring zero type-drift between external microservices and the UI.
- **Inferred Typings:** End-to-end type safety is maintained by inferring TypeScript interfaces directly from Zod schemas.

### Security & Role-Based Access Control (RBAC)
- **Simulated RLS (Row Level Security):** Demonstrates strict Postgres-style database security policies at the middleware layer.
- **Separation of Duties (MedCanG §7):** The system enforces legal conflict-of-interest protocols. `medical_doctor` roles are granted read/triage access but are cryptographically blocked from procurement execution, which is strictly restricted to the `verified_pharmacy` role.

---

## Regulatory Compliance Modules

### 1. B2B Pharmacy Procurement (GDP)
A high-density data interface engineered for rapid pharmacist workflow and strict compliance checking.
- **Vault Capacity Quotas:** The procurement controller validates order volume against a simulated 5,000g monthly pharmacy storage limit. Transactions exceeding insurance/vault capacity are rejected at the server action level.
- **Tiered Wholesale Pricing:** Real-time matrix calculating dynamic unit prices based on procurement volume.
- **Batch Traceability:** Full exposure of Certificate of Analysis (CoA) documentation, irradiation status, and Ph. Eur. compliance data.

### 2. Telemedicine FHIR Triage Engine
A module demonstrating standard interoperability with Gematik health data structures.
- **FHIR R4 Ingestion:** Parses nested, unstructured `MedicationRequest` JSON payloads into strict domain models.
- **MedCanG §3 Enforcement:** The triage engine automatically evaluates the `last_in_person_consultation` timestamp. Prescriptions violating the 365-day mandatory physical consultation rule, or lacking a Qualified Electronic Signature (QES), are systematically rejected.

### 3. Immutable Audit Vault
Designed to satisfy BfArM (Federal Institute for Drugs and Medical Devices) accountability requirements.
- **Cryptographic Chaining:** Every state mutation (auth changes, FHIR parsing, cart modifications) generates an event log appended with a simulated SHA-256 hash.
- **Actor Accountability:** Tracks the exact JWT identity (e.g., `DE-BTM-88291`) responsible for the interaction.

---

## Technical Implementation Details

### Deterministic Data Seeding
To facilitate stable UI testing and consistent architectural reviews, the mock database (`lib/mock-data.ts`) utilizes a seeded random algorithm. This ensures that the generated pharmaceutical batches, complete with dynamic pricing and expiry dates, remain identical across all user sessions without requiring a live database connection.

```typescript
// Deterministic seeding for stable evaluation environments
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
```

---

## Deployment & Orchestration

This repository is structured for modern enterprise CI/CD pipelines.

### Local Node Environment
```bash
npm install
npm run dev
```

### Docker Containerization
A multi-stage `Dockerfile` is included for orchestrating standalone builds in Kubernetes environments, minimizing image size by stripping development dependencies.

```bash
# Build the production-ready image
docker build -t calyx-systems-b2b .

# Execute the container
docker run -p 3000:3000 calyx-systems-b2b
```

---

## License & Usage

Copyright &copy; 2026 Trade Temple AB. All rights reserved.

This platform is a simulated technical demonstration intended solely for evaluation by prospective employers, technical recruiters, and systems architects. There is no actual narcotic supply chain, wholesale distribution, or medical triage occurring on this platform. All data is fictitious.

Permission is granted to inspect the codebase for evaluation purposes. You may not copy, modify, distribute, or use this software for any commercial application or public replication without explicit written authorization.