import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  MarkTodoDoneInputSchema,
  type CompletedTodoDocument,
  type TodoDocument,
} from '@case-study/shared';

export const markTodoDone = onCall(async (request) => {
  const result = MarkTodoDoneInputSchema.safeParse(request.data);
  if (!result.success) {
    throw new HttpsError('invalid-argument', result.error.issues[0].message);
  }

  const { todoId } = result.data;
  const db = getFirestore();
  const todoRef = db.collection('todos').doc(todoId);
  const todoDoc = await todoRef.get();

  if (!todoDoc.exists) {
    throw new HttpsError('not-found', `Todo ${todoId} not found`);
  }

  await todoRef.update({ completed: true });
  return { success: true };
});

export const onTodoUpdated = onDocumentUpdated('todos/{todoId}', async (event) => {
  const before = event.data?.before.data() as Omit<TodoDocument, 'id'> | undefined;
  const after = event.data?.after.data() as Omit<TodoDocument, 'id'> | undefined;

  if (!before || !after) return;

  // Only act when completed transitions from false → true
  if (before.completed !== false || after.completed !== true) return;

  const todoId = event.params.todoId;
  const db = getFirestore();

  type NewCompletedTodo = Omit<CompletedTodoDocument, 'id' | 'completedAt'> & {
    completedAt: FieldValue;
  };

  const completedTodo: NewCompletedTodo = {
    title: after.title,
    completedAt: FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(db.collection('completedTodos').doc(todoId), completedTodo);
  batch.delete(db.collection('todos').doc(todoId));
  await batch.commit();
});
