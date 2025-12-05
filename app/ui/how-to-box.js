"use client";
import React from 'react';
import HanziTile from './hanzi-tile';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function HowToBox({ open, onClose }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      aria-labelledby="how-to-play-title"
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ className: 'bg-white rounded-lg border-4 border-purple-500 p-6' }}
      data-testid="how-to-dialog"
    >
      <DialogTitle id="how-to-play-title" className="text-center text-2xl font-bold text-gray-800">How to Play</DialogTitle>
      <DialogContent dividers data-testid="how-to-content">
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">1.</span>
            <span>Click two characters to form a word</span>
            <div className="flex gap-2">
              <HanziTile character="好" inactive={true} />
              <HanziTile character="吃" inactive={true} />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">2.</span>
            <span>If the two characters form a valid Chinese word, they match!</span>
            <div className="flex gap-2">
              <HanziTile character="好" inactive={true} matchColor={'border-red-600'} />
              <HanziTile character="吃" inactive={true} matchColor={'border-red-600'} />
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">3.</span>
            <span>Making a wrong match gives you a strike. 3 strikes and you lose</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-fit">4.</span>
            <span>Match all the pairs, but keep in mind: some characters could form more than one word! Click matched tiles again to unpair them</span>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary" fullWidth data-testid="how-to-start-button">
          Start!
        </Button>
      </DialogActions>
    </Dialog>
  );
}
