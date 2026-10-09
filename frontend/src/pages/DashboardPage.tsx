import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const foundationAreas = [
  {
    label: 'Authentication',
    detail: 'Session state is isolated in React Context.',
  },
  {
    label: 'Expense filters',
    detail: 'Filter state is ready for Redux Toolkit selectors.',
  },
  {
    label: 'API boundary',
    detail: 'Axios is configured for the backend API and cookies.',
  },
];

export function DashboardPage() {
  return (
    <Stack spacing={5}>
      <Box sx={{ maxWidth: 700 }}>
        <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
          Foundation workspace
        </Typography>
        <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
          A calmer view of where your money goes.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
          Retain is ready for the next layer: secure authentication, owned expenses, and useful
          monthly signals without losing the thread.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {foundationAreas.map((area) => (
          <Grid key={area.label} size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {area.label}
                </Typography>
                <Typography color="text.secondary">{area.detail}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
