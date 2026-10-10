import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { getBudget, saveBudget } from "../../services/budgetService";
import type { BudgetSummary } from "../../types/budget";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatCurrency, monthLabel } from "../../utils/formatters";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/dashboard/StatCard";

export default function BudgetPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getBudget(year, month);
      setSummary(result);
      setAmount(result.budget ? String(result.budget.amount) : "");
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not load the monthly budget."));
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter a budget amount greater than zero.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveBudget({ amount: value.toFixed(2), month, year });
      setNotice("Monthly budget saved.");
      await load();
    } catch (reason) {
      setError(getErrorMessage(reason, "Could not save the monthly budget."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statusColor = summary?.status === "OVER" ? "error" : summary?.status === "APPROACHING" ? "warning" : "success";
  const percentage = Math.min(Math.max(summary?.percentage ?? 0, 0), 100);

  return (
    <>
      <PageHeading title="Monthly budget" subtitle={`Set a spending limit for ${monthLabel(month, year)}.`} />
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

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 750, mb: 1 }}>
                {summary?.budget ? "Update your budget" : "Set your budget"}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
                Choose the maximum amount you plan to spend this month. Retain compares it with your
                recorded expenses.
              </Typography>
              <Box component="form" onSubmit={handleSave}>
                <Stack spacing={2}>
                  <TextField
                    label="Monthly budget (USD)"
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    slotProps={{ htmlInput: { min: "0.01", step: "0.01" } }}
                    required
                    fullWidth
                  />
                  <Button type="submit" variant="contained" disabled={saving}>
                    {saving ? "Saving…" : "Save budget"}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                label="Monthly budget"
                value={formatCurrency(summary?.budget?.amount ?? 0)}
                helper="Your planned limit"
                icon={<AccountBalanceWalletOutlinedIcon />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <StatCard
                label="Total spent"
                value={formatCurrency(summary?.spent ?? 0)}
                helper="Expenses in this month"
                icon={<TrendingDownOutlinedIcon />}
              />
            </Grid>
            <Grid size={12}>
              <Card>
                <CardContent>
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 750 }}>
                      Budget status
                    </Typography>
                    <Chip color={statusColor} label={summary?.budget ? summary.status : "Not set"} />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {(summary?.percentage ?? 0).toFixed(0)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={statusColor}
                    sx={{ height: 10, borderRadius: 8, my: 2 }}
                  />
                  <Stack direction="row" sx={{ gap: 2, alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Remaining
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 750 }}>
                        {formatCurrency(summary?.remaining ?? 0)}
                      </Typography>
                    </Box>
                    <SavingsOutlinedIcon color="primary" sx={{ fontSize: 38 }} />
                  </Stack>
                  {!summary?.budget && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Save a budget to start tracking your monthly limit.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
