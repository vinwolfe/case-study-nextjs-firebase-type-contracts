/**
 * Integration tests for markTodoDone and onTodoUpdated.
 *
 * Prerequisites: Firebase Emulator must be running before executing these tests.
 *   firebase emulators:start --only firestore,functions
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { App, deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'demo-case-study';
const FUNCTIONS_BASE_URL = `http://localhost:5001/${PROJECT_ID}/us-central1`;

let adminApp: App;
let db: ReturnType<typeof getFirestore>;

beforeAll(() => {
  adminApp = initializeApp({ projectId: PROJECT_ID }, 'test-app');
  db = getFirestore(adminApp);
});

afterAll(async () => {
  await deleteApp(adminApp);
});

beforeEach(async () => {
  // Clear collections between tests for isolation
  const [todosSnap, completedSnap] = await Promise.all([
    db.collection('todos').get(),
    db.collection('completedTodos').get(),
  ]);
  const batch = db.batch();
  todosSnap.docs.forEach((d) => batch.delete(d.ref));
  completedSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
});

async function callMarkTodoDone(data: unknown) {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/markTodoDone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  return res.json();
}

async function waitFor(check: () => Promise<boolean>, timeout = 8000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await check()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Condition not met within timeout');
}

describe('markTodoDone', () => {
  it('sets completed: true on the todo', async () => {
    const docRef = await db.collection('todos').add({
      title: 'Test todo',
      completed: false,
      createdAt: new Date(),
    });

    const response = await callMarkTodoDone({ todoId: docRef.id });

    expect(response.result).toEqual({ success: true });
    const updated = await docRef.get();
    expect(updated.data()?.completed).toBe(true);
  });

  it('returns INVALID_ARGUMENT for an empty todoId', async () => {
    const response = await callMarkTodoDone({ todoId: '' });
    expect(response.error.status).toBe('INVALID_ARGUMENT');
  });

  it('returns INVALID_ARGUMENT for a missing todoId', async () => {
    const response = await callMarkTodoDone({});
    expect(response.error.status).toBe('INVALID_ARGUMENT');
  });

  it('returns NOT_FOUND for a non-existent todoId', async () => {
    const response = await callMarkTodoDone({ todoId: 'non-existent-id' });
    expect(response.error.status).toBe('NOT_FOUND');
  });
});

describe('onTodoUpdated', () => {
  it('moves a completed todo to completedTodos and removes it from todos', async () => {
    const docRef = await db.collection('todos').add({
      title: 'Todo to complete',
      completed: false,
      createdAt: new Date(),
    });

    await docRef.update({ completed: true });

    await waitFor(async () => {
      const completedDoc = await db.collection('completedTodos').doc(docRef.id).get();
      return completedDoc.exists;
    });

    const [todoDoc, completedDoc] = await Promise.all([
      docRef.get(),
      db.collection('completedTodos').doc(docRef.id).get(),
    ]);

    expect(todoDoc.exists).toBe(false);
    expect(completedDoc.data()?.title).toBe('Todo to complete');
    expect(completedDoc.data()?.completedAt).toBeDefined();
  });

  it('does not move a todo when completed transitions from true to false', async () => {
    const docRef = await db.collection('todos').add({
      title: 'Already completed',
      completed: true,
      createdAt: new Date(),
    });

    await docRef.update({ completed: false });

    // Wait to give the trigger time to fire if it were going to
    await new Promise((r) => setTimeout(r, 1500));

    const completedSnap = await db.collection('completedTodos').get();
    expect(completedSnap.empty).toBe(true);
  });
});
