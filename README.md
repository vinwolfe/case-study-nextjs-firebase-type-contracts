# case-study-nextjs-firebase-type-contracts

## The Assumption

A shared TypeScript package, imported by both a Next.js frontend and Firebase Cloud Functions via the pnpm `workspace:*` protocol, can enforce type contracts across the boundary — making type drift a build failure, not a runtime surprise.

## The Hypothesis

Both packages import a single source of truth. TypeScript's strict compilation, run across all packages in dependency order, catches any divergence at compile time. CI automation makes the enforcement team-scale: not a local convention, but a pipeline gate.

## The Result

**The assumption holds, with one documented limitation.**

All three contract types were successfully enforced at the module boundary. A field rename in the shared package produces compiler errors in both the frontend and the Cloud Function simultaneously — before tests run, before code ships. The CI pipeline blocks integration on any drift.

**The limitation — Firestore read boundaries are unverified.**

`doc.data()` returns `DocumentData` — effectively `any`. The `as TodoDocument` assertion at the Firestore read boundary is accepted by the compiler without verifying the runtime shape. The contract is enforced from code to code. It is not enforced from code to stored data.

See [docs/drift-example.md](./docs/drift-example.md) for the compiler output when a contract is broken, and [docs/alternatives.md](./docs/alternatives.md) for why Zod cannot close this gap and what can.

## What Surprised Us

**Zod's useful scope is narrower than expected.**
The initial assumption was that Zod would be broadly applicable across the workspace. In practice, it is only a genuine fit for the HTTPS callable payload — the one boundary where both sides handle plain JSON with no `Timestamp` fields. Firestore document shapes cannot use Zod due to incompatibility between Firebase's `Timestamp` type and Zod's primitive validators. The runtime validation boundary is narrower than it first appears.

**Firebase's dual SDK created a dependency problem `ITimestamp` solved.**
Firebase's client SDK (`firebase/firestore`) and admin SDK (`firebase-admin`) expose structurally incompatible `Timestamp` types. Importing either into the shared package would couple it to a specific SDK — creating version conflicts and defeating the package's neutrality. A minimal structural interface (`ITimestamp`) that both SDKs satisfy solved this without introducing any Firebase dependency into `@case-study/shared`. This emerged as a solution to a dependency problem, not a type-safety problem.

**The `workspace:*` protocol is load-bearing, not cosmetic.**
A published npm package allows consumers to pin to a stale version, reintroducing the drift problem the shared package is meant to prevent. The `workspace:*` protocol pins all consumers to the current local version of `@case-study/shared`. Version skew within the monorepo is structurally impossible. This distinction matters more than it first appears.

---

## The Three Contracts

### 1. Module boundary enforcement

TypeScript interfaces in `@case-study/shared` are imported by both `functions/` and `apps/web/`. The compiler enforces the contract across both consumers simultaneously.

```
packages/shared/src/types/todo.ts   ← single source of truth
        ↓                                    ↓
functions/src/todos.ts          apps/web/hooks/useTodos.ts
  TodoDocument (write side)       TodoDocument (read side)
```

Renaming `title` to `name` in `TodoDocument` produces errors in both packages without touching either consumer — the drift is caught at the module boundary.

### 2. Callable payload contracts via Zod

`MarkTodoDoneInputSchema` is defined once in `@case-study/shared`. The frontend uses the inferred type to shape the payload; the function validates the incoming request against the schema at runtime. One definition, enforced on both sides.

```ts
// packages/shared/src/schemas/todo.ts
export const MarkTodoDoneInputSchema = z.object({ todoId: z.string().min(1) });
export type MarkTodoDoneInput = z.infer<typeof MarkTodoDoneInputSchema>;

// functions/src/todos.ts — runtime enforcement
const result = MarkTodoDoneInputSchema.safeParse(request.data);

// apps/web — compile-time typed payload
```

This is the only boundary where both compile-time and runtime enforcement are simultaneously achievable. `CreateTodoInputSchema` is also co-located in `@case-study/shared` for consistency, but it is frontend-only — it validates a direct Firestore write with no function counterpart. In a production codebase, frontend-only schemas should live in the application package.

### 3. SDK boundary decoupling via `ITimestamp`

Rather than importing a Firebase `Timestamp` type into the shared package, a minimal structural interface is defined that both SDK implementations satisfy:

```ts
// packages/shared/src/types/timestamp.ts
export interface ITimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}
```

`@case-study/shared` has zero Firebase dependencies. The contract is defined in terms of shape, not origin.

---

## Quickstart

No real Firebase project needed. Everything runs locally against the Firebase Emulator Suite.

### Prerequisites

| Requirement | Install |
|---|---|
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | `npm install -g pnpm` |
| Java 11+ | `brew install --cask temurin` |

Java is required by the Firebase Emulator Suite. The emulator will not start without it.

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start everything: emulators + functions watcher + Next.js dev server
pnpm dev
```

The app is at `http://localhost:3000`. The Firebase Emulator UI is at `http://localhost:4000`.

### Reproduce the enforcement

```bash
# Build the shared package
pnpm --filter @case-study/shared build

# Type-check all packages — this is the enforcement mechanism
pnpm typecheck

# To see it fail: rename a field in packages/shared/src/types/todo.ts
# and run pnpm typecheck again
```

### Run all tests

```bash
# Unit tests — Zod schema contracts (no emulator needed)
pnpm --filter @case-study/shared test

# Integration tests — Cloud Functions against a real Firestore emulator
pnpm test
```

---

## Repository Structure

```
/
├── packages/
│   └── shared/                  @case-study/shared — single source of truth
│       └── src/
│           ├── types/           TodoDocument, CompletedTodoDocument, ITimestamp
│           └── schemas/         MarkTodoDoneInputSchema (Zod)
├── apps/
│   └── web/                     @case-study/web — Next.js 15, Tailwind v4
│       ├── hooks/               useTodos, useCompletedTodos (Firestore listeners)
│       └── components/          UI — exists only to exercise the contracts
├── functions/                   @case-study/functions — Firebase Functions v2
│   └── src/
│       ├── todos.ts             markTodoDone (callable), onTodoUpdated (trigger)
│       └── todos.test.ts        Integration tests against Firestore emulator
├── .github/workflows/ci.yml     Type-check → lint → test → build
└── docs/
    ├── drift-example.md         Exact compiler output when a contract is broken
    └── alternatives.md          Alternatives considered and why each was rejected
```

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Package manager | pnpm workspaces | `workspace:*` protocol pins consumers to the local version — version skew is impossible |
| Shared package | TypeScript strict mode | Structural typing, no `any`, enforced across all packages |
| Runtime validation | Zod | Scoped to callable payloads — the only boundary where plain JSON makes it viable |
| Frontend | Next.js 15, App Router | Canonical Firebase pairing; server/client boundary makes enforcement non-trivial |
| Backend | Firebase Functions v2 | Separate compilation context — the boundary the case study exists to test |
| Database | Cloud Firestore | Real-time listeners exercise the read boundary limitation |
| CI | GitHub Actions | Enforcement must hold under automation — a local `tsc` is a convention, not a contract |
| UI | Tailwind v4 + shadcn/ui | Minimal — exists only to make the contracts observable |
