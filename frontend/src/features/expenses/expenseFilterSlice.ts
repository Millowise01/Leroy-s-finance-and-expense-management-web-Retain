import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ExpenseSortField = 'date' | 'amount' | 'description';
export type SortDirection = 'asc' | 'desc';

export interface ExpenseFilters {
  searchTerm: string;
  categoryId: string | null;
  paymentMethod: string | null;
  startDate: string | null;
  endDate: string | null;
  minimumAmount: number | null;
  maximumAmount: number | null;
  sortField: ExpenseSortField;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
}

const initialState: ExpenseFilters = {
  searchTerm: '',
  categoryId: null,
  paymentMethod: null,
  startDate: null,
  endDate: null,
  minimumAmount: null,
  maximumAmount: null,
  sortField: 'date',
  sortDirection: 'desc',
  page: 1,
  pageSize: 20,
};

const expenseFilterSlice = createSlice({
  name: 'expenseFilters',
  initialState,
  reducers: {
    setFilter: <Key extends keyof ExpenseFilters>(
      state: ExpenseFilters,
      action: PayloadAction<{ key: Key; value: ExpenseFilters[Key] }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    resetFilters: () => initialState,
  },
});

export const { resetFilters, setFilter } = expenseFilterSlice.actions;
export const expenseFilterReducer = expenseFilterSlice.reducer;
