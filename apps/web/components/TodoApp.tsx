'use client';

import { Progress } from '@/components/ui/progress';
import { useCompletedTodos } from '@/hooks/useCompletedTodos';
import { useTodos } from '@/hooks/useTodos';
import { CompletedTodoList } from './CompletedTodoList';
import { TodoForm } from './TodoForm';
import { TodoList } from './TodoList';

export function TodoApp() {
  const todos = useTodos();
  const completedTodos = useCompletedTodos();

  const total = todos.length + completedTodos.length;
  const done = completedTodos.length;
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16 md:py-24">
      <div className="w-full max-w-lg relative">

        {/* Ghost counter */}
        <div
          aria-hidden="true"
          className="absolute -top-6 -right-2 md:-right-8 font-display leading-none font-bold select-none pointer-events-none tabular-nums anim-fade-in"
          style={{
            fontSize: 'clamp(8rem, 20vw, 14rem)',
            color: 'var(--c-ghost)',
            letterSpacing: '-0.04em',
          }}
        >
          {String(total).padStart(2, '0')}
        </div>

        {/* Header */}
        <header className="mb-10 relative anim-fade-in">
          <h1
            className="font-display leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 5.5rem)',
              fontWeight: 800,
              fontStyle: 'italic',
              color: 'var(--c-todo-text)',
              letterSpacing: '-0.03em',
            }}
          >
            To·do
          </h1>

          {/* Progress bar */}
          <div className="mt-5 flex items-center gap-3">
            <Progress
              value={progress}
              className="h-px flex-1 rounded-none"
              style={
                {
                  background: 'var(--c-item-border)',
                  '--progress-indicator-color': 'var(--c-amber)',
                } as React.CSSProperties
              }
            />
            <span
              className="font-mono text-[11px] tabular-nums shrink-0"
              style={{ color: 'var(--c-index)' }}
            >
              {done}/{total}
            </span>
          </div>
        </header>

        {/* Input */}
        <div className="anim-fade-in-delay">
          <TodoForm />
        </div>

        {/* Active todos */}
        {todos.length > 0 && (
          <section className="mt-8">
            <TodoList todos={todos} />
          </section>
        )}

        {/* Completed todos */}
        {completedTodos.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-4 mb-1">
              <span
                className="font-sans text-[10px] tracking-[0.25em] uppercase shrink-0"
                style={{ color: 'var(--c-index)' }}
              >
                Done
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--c-item-border)' }} />
              <span className="font-mono text-[11px] shrink-0" style={{ color: 'var(--c-index)' }}>
                {completedTodos.length}
              </span>
            </div>
            <CompletedTodoList todos={completedTodos} />
          </section>
        )}

        {/* Empty state */}
        {total === 0 && (
          <p
            className="mt-16 font-display text-2xl font-light text-center anim-fade-in-slow"
            style={{ color: 'var(--c-muted-fg)' }}
          >
            Nothing yet.
          </p>
        )}
      </div>
    </div>
  );
}
