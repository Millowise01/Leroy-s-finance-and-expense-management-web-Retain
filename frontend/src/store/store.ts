import { configureStore } from '@reduxjs/toolkit';
import { expenseFilterReducer } from '../features/expenses/expenseFilterSlice';

export const store = configureStore({
  reducer: {
    expenseFilters: expenseFilterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
