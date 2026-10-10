import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Link } from "react-router-dom";
import { getDashboard } from "../../services/dashboardService";
import type { DashboardData } from "../../types/dashboard";
import { formatCurrency, formatDate, monthLabel } from "../../utils/formatters";
import { getErrorMessage } from "../../utils/getErrorMessage";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/dashboard/StatCard";

export default function DashboardPage() {
  const now = new Date();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getDashboard(now.getMonth() + 1, now.getFullYear())
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [now.getMonth(), now.getFullYear()]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button onClick={() => window.location.reload()}>Retry</Button>}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return <Alert severity="info">No dashboard data is available.</Alert>;
  }

  const budgetStatus = data.status === "OVER" ? "error" : data.status === "APPROACHING" ? "warning" : "success";
  const percentage = Math.min(Math.max(data.percentage, 0), 100);

  return (
    <>
      <PageHeading
        title="Overview"
        subtitle={`Your spending snapshot for ${monthLabel(data.month, data.year)}.`}
        action={
          <Button component={Link} to="/expenses" variant="contained">
            Add or view expenses
          </Button>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            label="Spent this month"
            value={formatCurrency(data.totalSpent)}
            helper="Recorded expenses"
            icon={<TrendingDownOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            label="Monthly budget"
            value={formatCurrency(data.budget)}
            helper="Your spending limit"
            icon={<AccountBalanceWalletOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            label="Budget remaining"
            value={formatCurrency(data.remaining)}
            helper={data.remaining < 0 ? "Above your budget" : "Available this month"}
            icon={<SavingsOutlinedIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            label="Highest expense"
            value={data.highestExpense ? formatCurrency(data.highestExpense.amount) : formatCurrency(0)}
            helper={data.highestExpense?.title ?? "No expenses yet"}
            icon={<ReceiptLongOutlinedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 750 }}>
                  Budget progress
                </Typography>
                <Chip color={budgetStatus} label={data.budget <= 0 ? "Set a budget" : data.status} />
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {data.percentage.toFixed(0)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percentage}
                color={budgetStatus}
                sx={{ height: 10, borderRadius: 8, my: 2 }}
              />
              <Typography color="text.secondary" variant="body2">
                {data.budget > 0
                  ? `${formatCurrency(data.totalSpent)} spent out of ${formatCurrency(data.budget)}.`
                  : "Set a monthly budget to track your progress."}
              </Typography>
              <Button component={Link} to="/budget" sx={{ mt: 2 }}>
                Manage budget
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
                Spending by category
              </Typography>
              {data.spendingByCategory.length === 0 ? (
                <Typography color="text.secondary">
                  Your category breakdown will appear after you add expenses.
                </Typography>
              ) : (
                <Stack spacing={1.8}>
                  {data.spendingByCategory.slice(0, 6).map((item) => {
                    const share = data.totalSpent > 0 ? (item.amount / data.totalSpent) * 100 : 0;
                    return (
                      <Box key={item.categoryId}>
                        <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="body2">{item.categoryName}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatCurrency(item.amount)}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={share}
                          sx={{ height: 7, borderRadius: 8 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 750 }}>
                  Recent expenses
                </Typography>
                <Button component={Link} to="/expenses">
                  View all
                </Button>
              </Stack>

              {data.recentExpenses.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 3 }}>
                  No expenses recorded for this month yet.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Expense</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentExpenses.map((expense) => (
                        <TableRow key={expense.id} hover>
                          <TableCell>
                            <Typography sx={{ fontWeight: 650 }}>{expense.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {expense.paymentMethod.replaceAll("_", " ")}
                            </Typography>
                          </TableCell>
                          <TableCell>{expense.category.name}</TableCell>
                          <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                          <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
