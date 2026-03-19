'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import type { MarkTodoDoneInput, TodoDocument } from '@case-study/shared';
import { Button } from '@/components/ui/button';
import { functions } from '@/lib/firebase';

const markTodoDoneFn = httpsCallable<MarkTodoDoneInput, { success: boolean }>(
  functions,
  'markTodoDone',
);

interface TodoListProps {
  todos: TodoDocument[];
}

export function TodoList({ todos }: TodoListProps) {
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  async function handleMarkDone(todoId: string) {
    setCompleting((prev) => new Set(prev).add(todoId));
    const payload: MarkTodoDoneInput = { todoId };
    await markTodoDoneFn(payload);
  }

  return (
    <ul>
      {todos.map((todo, index) => {
        const isCompleting = completing.has(todo.id);
        return (
          <li
            key={todo.id}
            className="group flex items-center gap-4 py-[14px] transition-opacity duration-300"
            style={{
              borderBottom: '1px solid var(--c-item-border)',
              animation: 'todo-enter 0.2s ease both',
              animationDelay: `${index * 35}ms`,
              opacity: isCompleting ? 0.3 : 1,
            }}
          >
            {/* Index */}
            <span
              className="font-mono text-[11px] tabular-nums w-5 shrink-0 select-none"
              style={{ color: 'var(--c-index)' }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>

            {/* Title */}
            <span
              className="flex-1 font-mono text-sm leading-relaxed"
              style={{ color: 'var(--c-todo-text)' }}
            >
              {todo.title}
            </span>

            {/* Complete button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMarkDone(todo.id)}
              disabled={isCompleting}
              aria-label={`Mark "${todo.title}" as done`}
              className="w-[22px] h-[22px] rounded-full border opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:scale-110 active:scale-95 transition-all duration-200 hover:bg-transparent shrink-0"
              style={{
                borderColor: isCompleting ? 'var(--c-sage)' : 'var(--c-amber)',
                color: isCompleting ? 'var(--c-sage)' : 'var(--c-amber)',
              }}
            >
              <svg width="8" height="7" viewBox="0 0 8 7" fill="none" aria-hidden="true">
                <path
                  d="M1 3.5L3 5.5L7 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
