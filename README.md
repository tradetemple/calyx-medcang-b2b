# ⚕️ Calyx Systems | B2B MedCanG Procurement & Triage Engine

![Next.js](https://img.shields.io/badge/Next.js-15+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![Zod](https://img.shields.io/badge/Zod-Validation-3068b7)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Edge_Architecture-F38020?logo=cloudflare)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-443E38)

**Calyx Systems** is an architectural demonstration of a highly regulated, enterprise-grade B2B platform built for the German medical cannabis and pharmaceutical supply chain. 

It demonstrates how modern **Backend-For-Frontend (BFF)** architectures, strict runtime validation, and Edge computing can solve complex compliance requirements under the 2024/2026 **MedCanG** (Medical Cannabis Act) and **GDP** (Good Distribution Practice) frameworks.

---

## 🏗️ Architectural Overview

This platform rejects standard "e-commerce" patterns in favor of a secure, data-dense compliance engine.

- **Edge-Native Performance:** Deployed on **Cloudflare Pages** utilizing **Cloudflare Workers** and **KV Caching**. The product catalog runs with near-zero latency, ensuring instant inventory syncs for high-volume pharmacies.
- **Backend-For-Frontend (BFF):** The Next.js App Router is utilized as a secure middleware layer, processing client actions, verifying regulatory constraints server-side, and simulating hand-offs to external health/logistics microservices (e.g., Python/Go).
- **Strict Data Integrity:** `any` types are strictly forbidden. **Zod** is used as the ultimate gatekeeper for all incoming payloads, API requests, and state mutations, automatically inferring TypeScript interfaces to prevent runtime crashes.
- **Simulated RLS (Row Level Security):** Demonstrates strict Role-Based Access Control (RBAC) mimicking PostgreSQL/Supabase database-level security policies.

---

## ⚙️ Core Compliance Modules

### 1. B2B GDP Procurement Catalog
A high-density data grid replacing traditional retail cards, optimized for rapid pharmacist workflow.
- **Dynamic Tiered Pricing:** Real-time matrix calculating wholesale volume discounts.
- **Vault Capacity Guard:** Enforces a simulated `5,000g` monthly pharmacy storage quota. Transactions exceeding this limit are actively rejected by the UI and the Server Action.
- **Compliance Metadata:** Exposes strict batch numbers, future expiry dates, THC:CBD ratios, irradiation status, and downloadable Certificates of Analysis (CoAs).

### 2. Telemedicine FHIR Triage Engine
A split-screen simulator demonstrating interoperability with German government health data standards (Gematik).
- **FHIR Ingestion:** Ingests raw, nested `MedicationRequest` JSON payloads.
- **Zod Triage Pipeline:** Safely parses and flattens the JSON into typed patient dashboards.
- **§3 MedCanG Enforcement:** Automatically rejects prescriptions lacking a Qualified Electronic Signature (QES) or violating the 365-day mandatory in-person consultation rule.

### 3. Immutable Audit Vault
Designed for BfArM regulatory audits, tracking every state mutation across the system.
- **Actor Accountability:** Logs the exact JWT identity (e.g., `Pharmacy DE-BTM-88291`) performing the action.
- **Cryptographic Chaining:** Appends a simulated SHA-256 hash to every event.
- **Interaction Tracking:** Logs successful procurements, FHIR rejections, CoA document access, and unauthorized RBAC attempts.

---

## 🛡️ Security & Role-Based Access Control (RBAC)

The system enforces strict separation of duties:
*   **`guest`**: Blocked via simulated RLS 403 Terminal Error.
*   **`medical_doctor`**: Can view batches and parse prescriptions, but is strictly blocked from the procurement checkout to enforce MedCanG §7 (Separation of Prescriber and Dispenser).
*   **`verified_pharmacy`**: Full access to the B2B catalog, GDP shipping protocols, and the Audit Vault.

---

## 🚀 Local Development & Docker

This repository is container-ready for enterprise Kubernetes pipelines.

### Standard Setup
```bash
# 1. Clone the repository
git clone https://github.com/tradetemple/calyx-medcang-b2b.git
cd calyx-medcang-b2b

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev