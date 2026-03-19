# Alternatives Considered

## 1. Separate published npm package for shared types

**Approach:** Extract `@case-study/shared` into a standalone npm package, published to a registry.

**Why rejected:** Consumers can pin to a stale version of the package, reintroducing the drift problem the shared package is meant to prevent. A frontend team on `v1.2.0` of the shared package and a functions team on `v1.3.0` have a type contract mismatch that neither TypeScript nor CI will surface — both packages compile cleanly against their pinned version.

The `workspace:*` protocol is the critical difference. It pins all consumers to the local, current version of `@case-study/shared`. Version skew within the monorepo is structurally impossible.

---

## 2. Turborepo or Nx for build orchestration

**Approach:** Use a build orchestration tool to manage task dependency ordering and caching across packages.

**Why not adopted:** Turborepo and Nx solve build performance and task orchestration — not type enforcement. They are orthogonal to the thesis. Adding either would conflate the case study's focus.

The `pnpm --filter` script ordering in `package.json` is sufficient for a case study: `@case-study/shared` builds before its consumers, and `pnpm typecheck` runs across all packages in sequence. A real production monorepo should evaluate Turborepo; this case study deliberately excludes it to isolate the variable being tested.

---

## 3. Duplicating types in each package

**Approach:** Define `TodoDocument` separately in `functions/` and `apps/web/`, keeping the packages independent.

**Why rejected:** This is the problem the case study exists to prevent. Duplicated types diverge silently. When the function's response shape changes, the frontend's duplicate interface is not updated, TypeScript on each side passes, and the integration breaks at runtime. The shared package eliminates this class of bug entirely.

---

## 4. Zod for Firestore document shapes

**Approach:** Define Zod schemas for `TodoDocument` and `CompletedTodoDocument` in `@case-study/shared`, and use them to parse Firestore reads — providing runtime validation at the Firestore boundary.

**Why not adopted:** Firebase's `Timestamp` type is incompatible with Zod's primitive validators. A `Timestamp` field in Firestore returns a `firebase/firestore.Timestamp` object, not a plain number or string. Parsing it with a Zod schema would require a custom transformer on every `Timestamp` field, adding complexity without a clean solution.

Zod was scoped narrowly. `MarkTodoDoneInputSchema` — the HTTPS callable payload — is the only schema that is genuinely dual-use: the frontend sends it, the function validates it, and both sides share the same definition. `CreateTodoInputSchema` is also co-located in `@case-study/shared` for consistency, but it is frontend-only — it validates a direct Firestore write with no function counterpart. In a larger codebase, frontend-only schemas should live in the application package rather than the shared package.

**Potential mitigations for the Firestore boundary (out of scope for this case study):**

- **Firestore `withConverter`** — the SDK's built-in mechanism for typed document reads. Enforces shape at the SDK level before data reaches application code. Adds boilerplate but solves the runtime gap.
- **`zod-firestore` or equivalent** — community libraries that provide Zod-compatible `Timestamp` transformers. Worth evaluating in a production context.

---

## 5. GraphQL or tRPC as a typed API layer

**Approach:** Introduce a typed API layer between the frontend and Firebase, generating types from a schema.

**Why rejected:** Out of scope for the case study. The goal is to prove the minimum viable enforcement mechanism — a shared TypeScript package. Introducing a schema generation layer would obscure the thesis and significantly expand the implementation surface.
