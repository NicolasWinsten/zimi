'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, TextField } from '@mui/material';

export function DatePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
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
    
    // Update URL with new date parameter
    const params = new URLSearchParams(searchParams?.toString());
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
