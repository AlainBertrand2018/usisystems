# PRD: Multi-Tenancy & SaaS Architecture
## Project: UniDeals CRM Scale-Up

### 1. Executive Summary
This document outlines the transition of UniDeals CRM from a single-business tool to a multi-tenant SaaS platform capable of hosting 1,000+ distinct business entities (Tenants) on a single codebase with guaranteed data isolation and security.

### 2. Multi-Tenant Data Siloing
#### 2.1 The "Tenant Stamp"
Every document in Firestore (Clients, Products, Invoices, Appointments) MUST include a `businessId` field.
- **Implementation**: The `AuthContext` will globally provide the `activeBusinessId`.
- **Constraint**: No database write operation shall be permitted without a valid `businessId`.

#### 2.2 Server-Side Security Rules (Firestore)
Isolation is enforced at the database level to prevent cross-tenant data leaks.
```javascript
match /clients/{clientId} {
  allow read, write: if request.auth != null && 
    resource.data.businessId == getAuthUserBusinessId();
}
```

### 3. White-Labeling & Dynamic Branding
#### 3.1 Design Token System
Move from hardcoded hex values to CSS Variables (Design Tokens).
- **Core Tokens**: `--brand-primary`, `--brand-secondary`, `--brand-surface`.
- **Injection**: On App load, fetch the `branding` object from the `businesses` collection and override these variables in the `:root` style.

#### 3.2 Tenant Content Management (CMS)
Each Tenant Admin receives a "Business Settings" panel:
- **Logo Upload**: High-res SVG/PNG for dashboard and PDF headers.
- **Color Picker**: Selection of primary/secondary brand colors.
- **Document Metadata**: Custom Tax/VAT labels, Currency symbols (e.g., MUR vs USD), and Invoice numbering prefixes.

### 4. Advanced Security Framework
#### 4.1 Authentication Resilience
- **MFA Integration**: Optional TOTP (Authenticator App) or SMS codes for Super Admin and Admin roles.
- **Audit Logging**: Every sensitive action (Price changes, Data exports) is recorded in a `/system-logs/` collection.

#### 4.2 Data Encryption
- **At Rest**: Google Cloud KMS encryption for the underlying database disks.
- **In Transit**: Mandatory TLS 1.3 for all browser-server communications.

### 5. Operations & Health Dashboard (Super Admin)
#### 5.1 Real-Time Observability
A centralized interface for the Code Owner to monitor:
- **Latencies**: Average response time per tenant.
- **Error Rates**: Anomaly detection (e.g., "Client X is failing to generate PDFs").
- **Resource Usage**: Storage and bandwidth consumption per business.

#### 5.2 Predictive Healing
- **Automated Pulse Checks**: Synthetic bots running core flows 24/7.
- **Feature Flags**: Remote "Kill Switches" to disable malfunctioning features for specific tenants without a redeploy.

### 6. Disaster Recovery & Contingency
#### 6.1 Point-in-Time Recovery (PITR)
- **Granular Restore**: The ability to roll back a specific tenant's data to a state from 1 hour ago without affecting other tenants.
- **Off-Site Backups**: Weekly mirrored backups to a separate cloud region (e.g., Europe to North America).

#### 6.2 Offline Capability (PWA)
- Store critical lookup data in IndexedDB.
- Offline-Queue for "Save" operations that sync once the connection is restored.
