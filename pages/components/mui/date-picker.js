import React from 'react';
import { styled } from '@mui/system';
import DatePicker from '@mui/lab/DatePicker';
import { alpha } from '@mui/system';

const DateSelect = styled(DatePicker)(({ theme }) => ({
    '& .MuiFilledInput-root': {
        overflow: 'hidden',
        borderRadius: 5,
        backgroundColor: "transparent",
        color: "var(--primary)",
        border: "1px solid var(--alt)",
        '&:hover': {
            backgroundColor: 'transparent',
        },
        '&.Mui-focused': {
            borderColor: "var(--accent)",
            backgroundColor: "transparent"
        },
    },
}));

export default DateSelect;