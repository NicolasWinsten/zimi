"use client";
import React from 'react';
import HanziTile from './hanzi-tile';
import Button from '@mui/material/Button';
import MyDialog from './my-dialog';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function HowToBox({ open, onClose, hskLevel }) {
  return (
    <MyDialog
      data-testid="how-to-dialog"
      open={open}
      onClose={onClose}
      title="How to Play"
      subTitle={hskLevel ? `Today's Puzzle: HSK Level ${hskLevel}` : undefined}
      children={
        <Stack spacing={2} sx={{ color: 'text.secondary' }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
              <Typography fontWeight="bold" sx={{ minWidth: 'fit-content' }}>1.</Typography>
              <Typography>Click two characters to form a word</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ ml: 3 }}>
              <HanziTile character="好" inactive={true} />
              <HanziTile character="吃" inactive={true} />
            </Stack>
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2 }}>
              <Typography fontWeight="bold" sx={{ minWidth: 'fit-content' }}>2.</Typography>
              <Typography>If the two characters form a valid Chinese word, they match!</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ ml: 3 }}>
              <HanziTile character="好" inactive={true} matchColor={'border-red-600'} />
              <HanziTile character="吃" inactive={true} matchColor={'border-red-600'} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Typography fontWeight="bold" sx={{ minWidth: 'fit-content' }}>3.</Typography>
            <Typography>Making a wrong match gives you a strike. 3 strikes and you lose</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Typography fontWeight="bold" sx={{ minWidth: 'fit-content' }}>4.</Typography>
            <Typography>Match all the pairs, but keep in mind: some characters could form more than one word! Click matched tiles again to unpair them</Typography>
          </Stack>
        </Stack>
      }
      buttonContent="Start"
    />
  );
}
