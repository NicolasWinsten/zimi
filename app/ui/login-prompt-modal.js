'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { signIn } from 'next-auth/react';

export default function LoginPromptModal({ open, onClose }) {
  const handleSignIn = () => {
    signIn();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'bg-white rounded-lg border-4 border-purple-500 p-4'
      }}
    >
      <DialogTitle className="text-center text-2xl font-bold text-gray-800">
        Track Your Progress! 📊
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🔥 Start your streak
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Sign in to track your daily scores, build streaks, and compete with others!
          </Typography>
          <Box sx={{ 
            bgcolor: '#f3e8ff', 
            p: 2, 
            borderRadius: 2,
            border: '2px solid #9333ea'
          }}>
            <Typography variant="body2" color="text.secondary">
              ✨ Keep your streak alive by solving puzzles daily
              <br />
              🏆 Compete on the leaderboard
              <br />
              📈 Track your progress over time
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 1, pb: 2 }}>
        <Button 
          onClick={handleSignIn} 
          variant="contained" 
          color="primary" 
          fullWidth
          sx={{ maxWidth: 300 }}
        >
          Sign In to Start Tracking
        </Button>
        <Button 
          onClick={onClose} 
          variant="text" 
          color="inherit"
          size="small"
        >
          Maybe Later
        </Button>
      </DialogActions>
    </Dialog>
  );
}
