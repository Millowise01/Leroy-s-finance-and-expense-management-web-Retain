import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3659E3", dark: "#2442B8", light: "#E9EDFF" },
    secondary: { main: "#0F9D83" },
    background: { default: "#F6F8FC", paper: "#FFFFFF" },
    success: { main: "#16845B" },
    warning: { main: "#D88912" },
    error: { main: "#D64545" }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontSize: "clamp(1.7rem, 3vw, 2.2rem)" },
    button: { textTransform: "none", fontWeight: 700 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E8ECF4",
          boxShadow: "0 6px 24px rgba(30, 50, 90, 0.04)"
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 16
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: "medium" }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 750,
          color: "#64708A",
          backgroundColor: "#F8FAFD"
        }
      }
    }
  }
});
