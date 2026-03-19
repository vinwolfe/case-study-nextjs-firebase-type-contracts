# Drift Example: What the Enforcement Catches

This document demonstrates the failure mode the shared package prevents.

## Scenario: Renaming a field in a shared interface

Suppose a developer renames `title` to `name` in `TodoDocument` inside the shared package.

```diff
// packages/shared/src/types/todo.ts
 export interface TodoDocument {
   id: string;
-  title: string;
+  name: string;
   completed: boolean;
   createdAt: ITimestamp;
 }
```

Running `pnpm typecheck` immediately produces errors across both packages:

```
functions/src/todos.ts:33:18 - error TS2339:
  Property 'title' does not exist on type 'Omit<TodoDocument, "id">'.
  Did you mean 'name'?

apps/web/components/TodoList.tsx:24:16 - error TS2339:
  Property 'title' does not exist on type 'TodoDocument'.
  Did you mean 'name'?

apps/web/components/CompletedTodoList.tsx:33:16 - error TS2339:
  Property 'title' does not exist on type 'CompletedTodoDocument'.
  Did you mean 'name'?
```

The build fails. The developer must update all consumers before the change can compile. Drift is structurally impossible — not by convention.

---

## What CI adds

Locally, a developer could skip `tsc` and push directly. CI closes this gap:

```yaml
# .github/workflows/ci.yml
- name: Type-check
  run: pnpm typecheck
```

The type-check step runs before tests and before the production build. A PR that introduces drift cannot be merged — the pipeline fails at the verification step, not at runtime in production.

---

## The boundary this does not protect

The `as TodoDocument` assertion in the Firestore hooks is accepted by the compiler without verifying the runtime shape:

```ts
// apps/web/hooks/useTodos.ts
snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TodoDocument))
```

`doc.data()` returns `DocumentData` — effectively `any`. If the data stored in Firestore does not match `TodoDocument`, TypeScript will not catch it. The contract is enforced from code to code, not from code to stored data.

See the [Alternatives](./alternatives.md) document for mitigations.
