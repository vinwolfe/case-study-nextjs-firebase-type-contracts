import { ITimestamp } from './timestamp';

export interface TodoDocument {
  id: string;
  title: string;
  completed: boolean;
  createdAt: ITimestamp;
}

export interface CompletedTodoDocument {
  id: string;
  title: string;
  completedAt: ITimestamp;
}
