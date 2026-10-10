import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import SigninPage from "./pages/auth/SigninPage";
import SignupPage from "./pages/auth/SignupPage";

function DashboardPage() {
  return <h1>Dashboard</h1>;
}

function ExpensesPage() {
  return <h1>Expenses</h1>;
}

function BudgetPage() {
  return <h1>Budget</h1>;
}

function AdminPage() {
  return <h1>Admin Dashboard</h1>;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/signin"
        element={<SigninPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/expenses"
          element={<ExpensesPage />}
        />

        <Route
          path="/budget"
          element={<BudgetPage />}
        />

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminPage />}
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;
