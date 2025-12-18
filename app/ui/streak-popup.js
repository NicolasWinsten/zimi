'use client';

import React from 'react';
import { Dialog, DialogContent, Typography, Box } from '@mui/material';
import { motion } from 'motion/react';

export default function StreakPopup({ open, onClose, streakLength, isNewStreak }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      data-testid="streak-popup"
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '3px solid #9333ea',
          overflow: 'visible'
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Typography variant="h3" component="div" sx={{ fontSize: '4rem', mb: 2 }}>
            🔥
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            {isNewStreak ? 'Streak Started!' : 'Streak Updated!'}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9333ea', mb: 2 }} data-testid="streak-length">
            {streakLength} {streakLength === 1 ? 'Day' : 'Days'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep it up! Come back tomorrow to maintain your streak.
          </Typography>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
