import { Box, Container, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/useAuth';

export function AppLayout({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 2.5 }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{ justifyContent: 'space-between', gap: 1 }}
          >
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '0.16em', opacity: 0.75 }}>
                Personal finance
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Retain
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
              {status === 'loading' ? 'Restoring session...' : 'Foundation ready'}
            </Typography>
          </Stack>
        </Container>
      </Box>
      <Box component="main" sx={{ py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}
