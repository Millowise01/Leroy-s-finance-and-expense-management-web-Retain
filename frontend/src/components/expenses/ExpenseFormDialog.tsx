import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { Category } from "../../types/category";
import type { Expense, PaymentMethod } from "../../types/expense";
import type { ExpenseInput } from "../../services/expenseService";

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOBILE_MONEY", label: "Mobile money" },
  { value: "DEBIT_CARD", label: "Debit card" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
  { value: "OTHER", label: "Other" },
];

type Props = {
  open: boolean;
  categories: Category[];
  expense?: Expense | null;
  onClose: () => void;
  onSave: (input: ExpenseInput) => Promise<void>;
};

export default function ExpenseFormDialog({ open, categories, expense, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(expense?.title ?? "");
    setDescription(expense?.description ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setCategoryId(expense?.categoryId ?? categories[0]?.id ?? "");
    setPaymentMethod(expense?.paymentMethod ?? "CASH");
    setExpenseDate(
      expense
        ? new Date(expense.expenseDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    );
    setNotes(expense?.notes ?? "");
    setError("");
  }, [open, expense, categories]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const numericAmount = Number(amount);
    if (!title.trim()) return setError("Enter an expense title.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return setError("Amount must be greater than zero.");
    }
    if (!categoryId) return setError("Choose a category.");
    if (!expenseDate) return setError("Choose an expense date.");

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        amount: numericAmount.toFixed(2),
        categoryId,
        paymentMethod,
        expenseDate: new Date(`${expenseDate}T12:00:00`).toISOString(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this expense.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{expense ? "Edit expense" : "Add an expense"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <TextField
              label="Description (optional)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Amount (USD)"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              type="number"
              slotProps={{ htmlInput: { min: "0.01", step: "0.01" } }}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Payment method"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              fullWidth
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving || categories.length === 0}>
            {saving ? "Saving…" : "Save expense"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
