'use client';

import { Box, Typography, Button, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ErrorPage({ invalidWordList }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.push('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Invalid Word List
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          The word list you provided contains invalid or unrecognized words.
        </Typography>
        
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: '#f5f5f5',
            fontFamily: 'monospace',
            wordBreak: 'break-word',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Provided word list:</strong>
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {invalidWordList}
          </Typography>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please ensure all words are valid 2-character Chinese words from the HSK dictionary.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoBack}
          size="large"
        >
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
}
