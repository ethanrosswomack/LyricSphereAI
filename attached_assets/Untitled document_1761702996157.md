# **🛠️ Replit Agent Prompt — Fix the TypeScript & Runtime Errors**

You are working in a monorepo with `client/`, `server/`, and `shared/`. The `npm run check` output shows TypeScript errors caused by **type drift** between UI components, example components, server storage code, and the shared schema types. Please perform the following refactor to make types consistent and eliminate all errors.

## **✅ Goals**

1. **Unify types** of `Message` and `Citation` across client/server/shared.

2. Replace all usage of `timestamp` with `createdAt`.

3. Make `citation.url` optional (UI renders it when present).

4. Ensure `id` is consistently a **number** everywhere.

5. Fix `server/index.ts` (top-level `await` and `listen` overload).

6. Fix `server/storage.ts` to pass required fields to Drizzle `.insert(...)`.

7. Fix `shared/schema.ts` where `id: true` is wrongly typed as `never`.

8. Make `npm run check` pass with **zero** errors.

---

## **1\) Create canonical shared types**

**File:** `shared/schema.ts`

* Ensure Drizzle table definitions export proper `$inferSelect` and `$inferInsert` types.

* Export normalized app-facing types used by React components.

**Implement this shape (adjust to existing Drizzle tables if names differ):**

