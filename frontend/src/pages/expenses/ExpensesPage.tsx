import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  InputAdornment,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  resetFilters,
  setCategoryId,
  setEndDate,
  setMaxAmount,
  setMinAmount,
  setPage,
  setPaymentMethod,
  setSearch,
  setSortBy,
  setSortOrder,
  setStartDate,
} from "../../features/expenses/expenseFilterSlice";
import { createExpense, deleteExpense, getExpenses, updateExpense, type ExpensePage } from "../../services/expenseService";
import { getCategories } from "../../services/categoryService";
import type { Category } from "../../types/category";
import type { Expense } from "../../types/expense";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatCurrency, formatDate } from "../../utils/formatters";
import PageHeading from "../../components/common/PageHeading";
import ExpenseFormDialog from "../../components/expenses/ExpenseFormDialog";

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.expenseFilters);
  const [result, setResult] = useState<ExpensePage | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDelete, setSavingDelete] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pageData, categoryData] = await Promise.all([getExpenses(filters), getCategories()]);
      setResult(pageData);
      setCategories(categoryData);
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not load expenses."));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(input: Parameters<typeof createExpense>[0]) {
    try {
      if (editing) await updateExpense(editing.id, input);
      else await createExpense(input);
      setFormOpen(false);
      setEditing(null);
      setNotice(editing ? "Expense updated." : "Expense created.");
      await load();
    } catch (reason) {
      throw new Error(getErrorMessage(reason, "Could not save expense."));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSavingDelete(true);
    setError("");
    try {
      await deleteExpense(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Expense deleted.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not delete expense."));
    } finally {
      setSavingDelete(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeading
        title="Expenses"
        subtitle="Search, filter, and manage your recorded spending."
        action={
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
            Add expense
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      <Card sx={{ mb: 2.5 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Search expenses"
                value={filters.search}
                onChange={(event) => dispatch(setSearch(event.target.value))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ color: "text.secondary" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  label="Category"
                  value={filters.categoryId}
                  onChange={(event) => dispatch(setCategoryId(event.target.value))}
                >
                  <MenuItem value="">All categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="payment-filter-label">Payment</InputLabel>
                <Select
                  labelId="payment-filter-label"
                  label="Payment"
                  value={filters.paymentMethod}
                  onChange={(event) => dispatch(setPaymentMethod(event.target.value))}
                >
                  <MenuItem value="">All methods</MenuItem>
                  {[
                    "CASH",
                    "MOBILE_MONEY",
                    "DEBIT_CARD",
                    "CREDIT_CARD",
                    "BANK_TRANSFER",
                    "OTHER",
                  ].map((method) => (
                    <MenuItem key={method} value={method}>
                      {method.replaceAll("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                label="From date"
                type="date"
                value={filters.startDate}
                onChange={(event) => dispatch(setStartDate(event.target.value))}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                label="To date"
                type="date"
                value={filters.endDate}
                onChange={(event) => dispatch(setEndDate(event.target.value))}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                label="Min amount"
                type="number"
                value={filters.minAmount}
                onChange={(event) => dispatch(setMinAmount(event.target.value))}
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                label="Max amount"
                type="number"
                value={filters.maxAmount}
                onChange={(event) => dispatch(setMaxAmount(event.target.value))}
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="sort-field-label">Sort by</InputLabel>
                <Select
                  labelId="sort-field-label"
                  label="Sort by"
                  value={filters.sortBy}
                  onChange={(event) => dispatch(setSortBy(event.target.value as "date" | "amount"))}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="sort-order-label">Order</InputLabel>
                <Select
                  labelId="sort-order-label"
                  label="Order"
                  value={filters.sortOrder}
                  onChange={(event) => dispatch(setSortOrder(event.target.value as "asc" | "desc"))}
                >
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button
                fullWidth
                sx={{ height: 56 }}
                startIcon={<RestartAltOutlinedIcon />}
                onClick={() => dispatch(resetFilters())}
              >
                Reset filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 750 }}>
              All expenses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {result?.pagination.total ?? 0} records
            </Typography>
          </Stack>

          {loading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : !result?.expenses.length ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700 }}>No expenses found</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Change your filters or add your first expense.
              </Typography>
              <Button sx={{ mt: 2 }} variant="contained" onClick={openCreate}>
                Add expense
              </Button>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Expense</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.expenses.map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 650 }}>{expense.title}</Typography>
                        {expense.description && (
                          <Typography variant="caption" color="text.secondary">
                            {expense.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{expense.category.name}</TableCell>
                      <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                      <TableCell>{expense.paymentMethod.replaceAll("_", " ")}</TableCell>
                      <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton aria-label={`Edit ${expense.title}`} onClick={() => openEdit(expense)}>
                            <EditOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label={`Delete ${expense.title}`}
                            color="error"
                            onClick={() => setDeleteTarget(expense)}
                          >
                            <DeleteOutlineOutlinedIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {result && result.pagination.totalPages > 1 && (
            <Stack sx={{ alignItems: "center", mt: 3 }}>
              <Pagination
                page={filters.page}
                count={result.pagination.totalPages}
                onChange={(_event, page) => dispatch(setPage(page))}
                color="primary"
              />
            </Stack>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={formOpen}
        categories={categories}
        expense={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => !savingDelete && setDeleteTarget(null)}>
        <DialogTitle>Delete this expense?</DialogTitle>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={savingDelete}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={savingDelete}>
            {savingDelete ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
