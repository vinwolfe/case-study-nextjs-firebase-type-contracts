import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { CompletedTodoDocument } from '@case-study/shared';
import { db } from '@/lib/firebase';

export function useCompletedTodos(): CompletedTodoDocument[] {
  const [completedTodos, setCompletedTodos] = useState<CompletedTodoDocument[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'completedTodos'), orderBy('completedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCompletedTodos(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CompletedTodoDocument)),
      );
    });
    return unsubscribe;
  }, []);

  return completedTodos;
}
