# 💰 Technical Manual: Money Manager Pro

## 1. System Overview
**Type**: Personal Finance Progressive Web App (PWA)
**Stack**: Firebase v12 (Auth, Firestore) + Vanilla JS + Chart.js
**Key Feature**: Real-time sync, Monthly Analysis Reports, and Data Visualization.

## 2. Code Logic Analysis (`public/script.js`)

### A. Authentication & User Provisioning
**Function**: `autoCreateUserDocument()`
**Trigger**: `onAuthStateChanged`
**Logic**:
1.  Checks if `users/{uid}` exists.
2.  If new, creates doc with `{ email, createdAt, displayName }`.
3.  If existing but missing `fullName`, prompts user via `prompt()` (Simple MVP approach).
4.  This ensures every authenticated user has a database record for linking data.

### B. Transaction Management
**Functions**: `addTransaction()`, `deleteTransaction()`
**Data Structure**: Stored in **Sub-collection**: `users/{uid}/transactions/{txnId}`.
**Fields**: `{ description, amount, category, type ('income'/'expense'), date, createdAt }`.
**Logic**:
*   **Add**: Validates inputs -> `addDoc` -> Clears form -> `loadTransactions()`.
*   **Delete**: Confirms -> `deleteDoc` -> Reloads list.

### C. Reporting & Analytics
**Logic**:
1.  **Dashboard**: Client-side calculation of `income - expenses = balance`.
2.  **Chart**: Hooked into `updateUI`. Uses `Chart.js` (Doughnut).
    *   Aggregates expenses by category: `totals[cat] += amount`.
    *   Dynamic colors array assigned to labels.
3.  **Monthly Report** (`showMonthlyReport()`):
    *   Calculates "This Month" vs "Last Month" totals.
    *   Computes percentage trend (e.g., "15% less than last month").
    *   Finds Top Spending Category by sorting aggregated entries.

### D. Budget System
**Collection**: `users/{uid}/budgets/{categoryId}`
**Logic**:
*   User sets a `limit` for a `category`.
*   **Progress Bar**: Calculated dynamically during render:
    *   `spent = sum(transactions where category == budget.category && date == currentMonth)`
    *   `percent = (spent / limit) * 100`
    *   CSS classes `warning` (>70%) and `danger` (>90%) applied based on percent.

## 3. Data Dictionary (Firestore)

**Path**: `users/{userId}`

| Sub-Collection | Document ID | Fields | Notes |
| :--- | :--- | :--- | :--- |
| **`transactions`** | Auto-ID | `amount` (number), `category` (string), `date` (ISO string), `description` (string), `type` ('income'/'expense') | Main data stream. |
| **`budgets`** | Category Name | `limit` (number), `updatedAt` (timestamp) | Doc ID is category name to enforce uniqueness. |

## 4. Configuration
**File**: `public/firebase-config.js` (Imported in index.html) or `script.js` imports.
**Version**: Firebase Web SDK v12.7.0 (ES Modules via GStatic CDN).
