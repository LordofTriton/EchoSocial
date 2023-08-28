import React from "react";
import { alpha, styled } from '@mui/material/styles';
import TextField, { TextFieldProps } from '@mui/material/TextField';

const TextInput = styled((props) => (
    <TextField
        InputProps={{ disableUnderline: true }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiFilledInput-root': {
        overflow: 'hidden',
        borderRadius: 5,
        backgroundColor: "transparent",
        color: "#515365",
        border: "1px solid var(--alt)",
        transition: theme.transitions.create([
            'border-color',
            'background-color',
            'box-shadow',
        ]),
        zIndex: 0,
        '&:hover': {
            backgroundColor: 'transparent'
        },
        '&.Mui-focused': {
            borderColor: "var(--accent)",
            backgroundColor: "transparent"
        },
    },
    '& .MuiInputLabel-root': {
        color: "var(--alt)",
        zIndex: 1,
        '&.Mui-focused': {
            color: "var(--accent)"
        }
    }
}));

export default TextInput;