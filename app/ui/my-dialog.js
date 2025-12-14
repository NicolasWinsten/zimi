'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function MyDialog({
  open,
  onClose,
  title,
  subTitle,
  children,
  buttonContent,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ className: 'bg-white rounded-lg border-4 border-purple-500 p-6' }}
    >
      { title && <DialogTitle className="text-center text-2xl font-bold text-gray-800">
        {title}
        { subTitle && <div className="text-sm font-normal text-purple-600 mt-1"> {subTitle} </div> }
      </DialogTitle> }
      
      {children && <DialogContent dividers>
        {children}
      </DialogContent>}
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary" fullWidth >
          {buttonContent}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
