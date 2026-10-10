import {
  createSlice,
  type PayloadAction
} from "@reduxjs/toolkit";
import type { ExpenseFilters } from "../../types/expense";

const initialState: ExpenseFilters = {
  search: "",
  categoryId: "",
  paymentMethod: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  sortBy: "date",
  sortOrder: "desc",
  page: 1,
  limit: 10
};

const expenseFilterSlice = createSlice({
  name: "expenseFilters",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },

    setCategoryId(
      state,
      action: PayloadAction<string>
    ) {
      state.categoryId = action.payload;
      state.page = 1;
    },

    setPaymentMethod(
      state,
      action: PayloadAction<string>
    ) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },

    setStartDate(
      state,
      action: PayloadAction<string>
    ) {
      state.startDate = action.payload;
      state.page = 1;
    },

    setEndDate(
      state,
      action: PayloadAction<string>
    ) {
      state.endDate = action.payload;
      state.page = 1;
    },

    setMinAmount(
      state,
      action: PayloadAction<string>
    ) {
      state.minAmount = action.payload;
      state.page = 1;
    },

    setMaxAmount(
      state,
      action: PayloadAction<string>
    ) {
      state.maxAmount = action.payload;
      state.page = 1;
    },

    setSortBy(
      state,
      action: PayloadAction<"date" | "amount">
    ) {
      state.sortBy = action.payload;
      state.page = 1;
    },

    setSortOrder(
      state,
      action: PayloadAction<"asc" | "desc">
    ) {
      state.sortOrder = action.payload;
      state.page = 1;
    },

    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    resetFilters() {
      return initialState;
    }
  }
});

export const {
  setSearch,
  setCategoryId,
  setPaymentMethod,
  setStartDate,
  setEndDate,
  setMinAmount,
  setMaxAmount,
  setSortBy,
  setSortOrder,
  setPage,
  resetFilters
} = expenseFilterSlice.actions;

export default expenseFilterSlice.reducer;