import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { markTodoDone, onTodoUpdated } from './todos';
