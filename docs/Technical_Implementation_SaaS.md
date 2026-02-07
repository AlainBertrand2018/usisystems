# Technical Guide: The Whitelabel Branding Engine
## Implementation Logic for UniDeals CRM

### 1. Database Schema (Firestore)
**Collection**: `businesses`
```typescript
interface BusinessConfig {
  id: string;              // Tenant Slug
  name: string;            // Official Name
  branding: {
    primaryColor: string;  // Hex for UI buttons/accents
    secondaryColor: string; 
    logoUrl: string;       // Public storage URL
    letterheadUrl: string; // High-res PDF header
    fontFamily: string;    // Selected from whitelist
  };
  settings: {
    currency: string;      // MUR, USD, etc.
    taxRate: number;       // Default 15%
  };
}
```

### 2. The Injection Process (Frontend)
When the `AuthProvider` initializes, it must fetch the business config and apply it to the DOM.

**Component**: `src/components/BrandingProvider.tsx` (Logic)
```tsx
const applyBranding = (config: BusinessConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', config.branding.primaryColor);
  root.style.setProperty('--brand-logo', `url(${config.branding.logoUrl})`);
};
```

---

# Technical Guide: System Health & Restoration Dashboard
## Logic for Code Owner Cockpit

### 1. Prediction Logic (Anomaly Detection)
- **Metric**: Success Rate of `createInvoice`.
- **Threshold**: If `failCount / totalAttempt > 0.05` for a specific tenant in 10 minutes, trigger **Warning**.
- **Alert**: Push notification to Code Owner via Cloud Functions + FCM.

### 2. The Healing Process (Automated)
- **Problem**: Storage Bucket CORS mismatch.
- **Solution**: A Cloud Function runs every 24h to "Re-set" valid CORS headers on the bucket, overriding any accidental manual changes.

### 3. Granular Restoration Tool
**Utility**: `restore-tenant-silo.js`
1. Access the last valid Firestore Backup.
2. Filter documents by `businessId`.
3. Overwrite the *active* branch for that ID only.
4. Log the restore event (Who, Why, When).

### 4. Tenant Health Score (0-100)
Calculated based on:
- **Uptime**: (Server Availability) - 40%
- **Error Rate**: (In-app crashes) - 40%
- **Latency**: (P95 Response time) - 20%
