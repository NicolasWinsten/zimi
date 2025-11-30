"use client";
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HowToBox from './how-to-box';

export default function HelpButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="help"
      >
        <HelpOutlineIcon fontSize="large" />
      </IconButton>
      <HowToBox open={open} onClose={handleClose} />
    </>
  );
}
