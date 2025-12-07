'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, TextField } from '@mui/material';

export default function DatePicker() {
  return(
    <Suspense>
      <DatePicker_ />
    </Suspense>
  )
}

function DatePicker_() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Only show date picker if dev mode is enabled
  const devMode = searchParams?.get('dev') === 'true';
  
  if (!devMode) {
    return null;
  }
  
  // Get current date or date from search params
  const getInitialDate = () => {
    const paramDate = searchParams?.get('date');
    if (paramDate) {
      // Validate the date from search params
      const testDate = new Date(paramDate);
      if (!isNaN(testDate.getTime())) {
        return paramDate;
      }
    }
    return new Date().toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getInitialDate());

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    
    // Update URL with new date parameter, keeping dev=true
    const params = new URLSearchParams(searchParams?.toString());
    params.set('dev', 'true'); // Ensure dev mode stays enabled
    if (newDate) {
      params.set('date', newDate);
    } else {
      params.delete('date');
    }
    
    // Navigate to the new URL
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : '/');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        size="small"
        InputProps={{
          sx: {
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            borderRadius: 1,
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#9333ea',
            },
            '&:hover fieldset': {
              borderColor: '#7c3aed',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6b21a8',
            },
          },
        }}
      />
    </Box>
  );
}
