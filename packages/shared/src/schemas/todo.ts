import { z } from 'zod';

export const CreateTodoInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;

export const MarkTodoDoneInputSchema = z.object({
  todoId: z.string().min(1, 'todoId is required'),
});

export type MarkTodoDoneInput = z.infer<typeof MarkTodoDoneInputSchema>;
