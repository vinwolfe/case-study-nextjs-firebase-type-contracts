'use client';

import type { CompletedTodoDocument } from '@case-study/shared';

interface CompletedTodoListProps {
  todos: CompletedTodoDocument[];
}

export function CompletedTodoList({ todos }: CompletedTodoListProps) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li
          key={todo.id}
          className="flex items-center gap-4 py-3"
          style={{
            animation: 'todo-enter 0.2s ease both',
            animationDelay: `${index * 30}ms`,
          }}
        >
          {/* Index */}
          <span
            className="font-mono text-[11px] tabular-nums w-5 shrink-0 line-through select-none"
            style={{ color: 'var(--c-done-text)' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          {/* Title */}
          <span
            className="flex-1 font-mono text-sm line-through"
            style={{ color: 'var(--c-done-text)' }}
          >
            {todo.title}
          </span>

          {/* Done mark */}
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            aria-hidden="true"
            style={{ color: 'var(--c-sage)', flexShrink: 0 }}
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </li>
      ))}
    </ul>
  );
}
