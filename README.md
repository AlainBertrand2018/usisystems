# UniDeals CRM Data Seeder

This project contains a seeding script to populate your Firestore database with sample CRM data for:
- `business_products`
- `businessdetails`
- `clients`
- `invoices`
- `quotations`
- `receipts`
- `statements`
- `users`

## Prerequisites
1. Ensure your Firebase project is correctly set up.
2. **Permission Check**: By default, Firestore denies all writes. To use this script, you must either:
   - **Option A (Easiest)**: Go to the Firebase Console > Firestore > Rules and set:
     ```javascript
     allow read, write: if true;
     ```
     *(Note: Only do this temporarily for seeding)*.
   - **Option B**: Enable **Anonymous Authentication** in Firebase Console > Authentication > Sign-in method.

## Security & Roles (RBAC)
The database is configured with the following roles in the `users` collection:

### 1. Super Admin (`super_admin`)
- **Profile**: System owner/developer.
- **Permissions**: Full Database CRUD rights.
- **Privacy**: Cannot read (list/get) Transactional data (`invoices`, `quotations`, etc.) but can modify/delete them for maintenance.

### 2. Admin (`admin`)
- **Profile**: Business manager.
- **Permissions**: Complete access to everything. Can create, edit, and delete all records.
- **Restriction**: Restricted to Firestore level (no Firebase Console/Platform access).

### 3. User (`user`)
- **Profile**: Staff/Standard user.
- **Permissions**: Can view and edit `products`, `clients`, and transactions.
- **Restriction**: **Cannot delete** anything.

## Deployment
1. Copy the contents of `firestore.rules` to your Firebase Console.
2. Ensure your user documents in the `users` collection have the appropriate `role` field.
