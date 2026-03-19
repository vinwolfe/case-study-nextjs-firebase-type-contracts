import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { TodoDocument } from '@case-study/shared';
import { db } from '@/lib/firebase';

export function useTodos(): TodoDocument[] {
  const [todos, setTodos] = useState<TodoDocument[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'todos'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTodos(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TodoDocument)),
      );
    });
    return unsubscribe;
  }, []);

  return todos;
}
