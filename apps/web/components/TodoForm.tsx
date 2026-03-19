'use client';

import { useState } from 'react';
import { addDoc, collection, FieldValue, serverTimestamp } from 'firebase/firestore';
import { CreateTodoInputSchema, type TodoDocument } from '@case-study/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';

type NewTodo = Omit<TodoDocument, 'id' | 'createdAt'> & { createdAt: FieldValue };

export function TodoForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = CreateTodoInputSchema.safeParse({ title });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const newTodo: NewTodo = {
      title: result.data.title,
      completed: false,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'todos'), newTodo);
    setTitle('');
    setError(null);
    setSubmitting(false);
  }

  const active = title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="flex items-center gap-3 transition-colors duration-300"
        style={{
          borderBottom: `1px solid ${active ? 'var(--c-amber)' : 'var(--c-item-border)'}`,
          paddingBottom: '10px',
        }}
      >
        {/* Prompt glyph */}
        <span
          className="font-mono text-base select-none transition-opacity duration-200 shrink-0"
          style={{ color: 'var(--c-amber)', opacity: active ? 1 : 0.35 }}
        >
          +
        </span>

        <Input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(null); }}
          placeholder="Add a task…"
          disabled={submitting}
          autoComplete="off"
          className="flex-1 border-none bg-transparent shadow-none rounded-none px-0 font-mono text-sm focus-visible:ring-0 placeholder:text-muted-foreground/35"
          style={{ color: 'var(--c-todo-text)' }}
        />

        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={submitting || !active}
          className="font-mono text-sm px-2 h-auto py-0 transition-opacity duration-150 disabled:opacity-0 hover:bg-transparent"
          style={{ color: 'var(--c-amber)' }}
          aria-label="Add task"
        >
          {submitting ? '…' : '↵'}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-2 font-mono text-xs" style={{ color: 'oklch(0.7 0.18 25)' }}>
          {error}
        </p>
      )}
    </form>
  );
}
