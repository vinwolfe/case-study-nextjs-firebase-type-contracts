import { describe, it, expect } from 'vitest';
import { CreateTodoInputSchema, MarkTodoDoneInputSchema } from './todo';

describe('CreateTodoInputSchema', () => {
  it('parses a valid input', () => {
    expect(CreateTodoInputSchema.parse({ title: 'Buy milk' })).toEqual({ title: 'Buy milk' });
  });

  it('rejects an empty title', () => {
    expect(() => CreateTodoInputSchema.parse({ title: '' })).toThrow();
  });

  it('rejects a missing title', () => {
    expect(() => CreateTodoInputSchema.parse({})).toThrow();
  });

  it('rejects a non-string title', () => {
    expect(() => CreateTodoInputSchema.parse({ title: 42 })).toThrow();
  });
});

describe('MarkTodoDoneInputSchema', () => {
  it('parses a valid input', () => {
    expect(MarkTodoDoneInputSchema.parse({ todoId: 'abc123' })).toEqual({ todoId: 'abc123' });
  });

  it('rejects an empty todoId', () => {
    expect(() => MarkTodoDoneInputSchema.parse({ todoId: '' })).toThrow();
  });

  it('rejects a missing todoId', () => {
    expect(() => MarkTodoDoneInputSchema.parse({})).toThrow();
  });

  it('rejects a non-string todoId', () => {
    expect(() => MarkTodoDoneInputSchema.parse({ todoId: 123 })).toThrow();
  });
});
