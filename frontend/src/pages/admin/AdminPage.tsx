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
  DialogContent,
  DialogTitle,
  IconButton,
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
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { getAdminInsights } from "../../services/adminService";
import { createCategory, deleteCategory, getCategories, updateCategory, type CategoryInput } from "../../services/categoryService";
import type { AdminInsights } from "../../types/admin";
import type { Category } from "../../types/category";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/getErrorMessage";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/dashboard/StatCard";

export default function AdminPage() {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stats, categoryList] = await Promise.all([getAdminInsights(), getCategories()]);
      setInsights(stats);
      setCategories(categoryList);
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not load admin insights."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setCategoryName("");
    setDescription("");
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setCategoryName(category.name);
    setDescription(category.description ?? "");
    setDialogOpen(true);
  }

  async function handleSave(event: import("react").FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input: CategoryInput = {
      name: categoryName.trim(),
      description: description.trim() || undefined,
    };

    if (input.name.length < 2) {
      setError("Category name must contain at least two characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editing) await updateCategory(editing.id, input);
      else await createCategory(input);
      setDialogOpen(false);
      setNotice(editing ? "Category updated." : "Category created.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not save category."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setError("");
    try {
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Category deleted.");
      await load();
    } catch (reason) {
      setError(
        getErrorMessage(
          reason,
          "Could not delete category. A category used by an expense may not be deletable.",
        ),
      );
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <PageHeading title="Admin dashboard" subtitle="Platform activity and expense category management." />
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

      {insights && (
        <>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatCard
                label="Registered users"
                value={String(insights.totalUsers)}
                helper="All accounts"
                icon={<PeopleAltOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatCard
                label="Total expenses"
                value={String(insights.totalExpenses)}
                helper="All recorded expenses"
                icon={<ReceiptLongOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatCard
                label="Total expense value"
                value={formatCurrency(insights.totalExpenseValue)}
                helper="Across the platform"
                icon={<PaymentsOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatCard
                label="This month"
                value={String(insights.currentMonthExpenses)}
                helper="Expenses recorded this month"
                icon={<CalendarMonthOutlinedIcon />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedCategories title="Top 5 most-used categories" rows={insights.topCategories} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RankedCategories title="Bottom 5 least-used categories" rows={insights.bottomCategories} />
            </Grid>
          </Grid>

          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
                Spending per category
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Expenses</TableCell>
                      <TableCell align="right">Total spent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {insights.spendingPerCategory.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell align="right">{row.expenseCount}</TableCell>
                        <TableCell align="right">{formatCurrency(row.totalSpent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
                    Recently added expenses
                  </Typography>
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Expense</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {insights.recentExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 650 }}>{expense.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(expense.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>{expense.user.name}</TableCell>
                            <TableCell>{expense.category.name}</TableCell>
                            <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
                    Recently registered users
                  </Typography>
                  <Stack divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />} spacing={1.5}>
                    {insights.recentUsers.map((person) => (
                      <Box key={person.id} sx={{ py: 0.5 }}>
                        <Stack direction="row" sx={{ gap: 1, justifyContent: "space-between" }}>
                          <Typography sx={{ fontWeight: 650 }}>{person.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{person.role}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {person.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {person.createdAt ? formatDate(person.createdAt) : "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: { sm: "center" }, mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 750 }}>
                Expense categories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories are shared across the platform.
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              Add category
            </Button>
          </Stack>
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description || "—"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton aria-label={`Edit ${category.name}`} onClick={() => openEdit(category)}>
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          aria-label={`Delete ${category.name}`}
                          color="error"
                          onClick={() => setDeleteTarget(category)}
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="sm">
        <form onSubmit={handleSave}>
          <DialogTitle>{editing ? "Edit category" : "Create category"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Category name"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                required
                slotProps={{ htmlInput: { maxLength: 50 } }}
              />
              <TextField
                label="Description (optional)"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                minRows={2}
                slotProps={{ htmlInput: { maxLength: 200 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving…" : "Save category"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete category “{deleteTarget?.name}”?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            The server may reject deletion if expenses already use this category.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function RankedCategories({ title, rows }: Readonly<{ title: string; rows: AdminInsights["topCategories"] }>) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
          {title}
        </Typography>
        {rows.length === 0 ? (
          <Typography color="text.secondary">No category data available.</Typography>
        ) : (
          <Stack spacing={1.5}>
            {rows.map((row, index) => (
              <Stack key={row.id} direction="row" sx={{ gap: 2, alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" sx={{ gap: 1.5, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 750,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 650 }}>{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.expenseCount} expenses
                    </Typography>
                  </Box>
                </Stack>
                <Typography sx={{ fontWeight: 700 }}>{formatCurrency(row.totalSpent)}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
