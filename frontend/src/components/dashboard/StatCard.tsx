import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  helper,
  icon,
  }: Readonly<{
  label: string;
  value: string;
  helper?: string;
  icon: ReactNode;
  }>) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {value}
            </Typography>
            {helper && (
              <Typography variant="caption" color="text.secondary">
                {helper}
              </Typography>
            )}
          </Stack>
          <Stack
            sx={{
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: "primary.light",
              color: "primary.main",
            }}
          >
            {icon}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
