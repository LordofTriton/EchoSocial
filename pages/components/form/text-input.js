import React, { useState } from "react";
import styles from "./form.module.css"

export default function TextInput({type, label, style, value, onChange, placeholder, isValid, error}) {
    const [showError, setShowError] = useState(false)
    const [focused, setFocused] = useState(false)

    return (
        <>
            <div className={styles.formTextInputField} style={style}>
                <span className={styles.formTextInputFieldLabel}>
                    {label}
                    {showError && (value || focused) ? <span className={styles.formErrorMessage}>({error ?? "Invalid input."})</span> : null}
                </span>
                <input 
                    type={type? type : "text"} 
                    className={styles.formTextInputFieldInput} 
                    value={value} 
                    onChange={(e) => {
                        isValid && e.target.value ? setShowError(!isValid(e.target.value)) : null;
                        onChange(e);
                        setFocused(true);
                    }} 
                    placeholder={placeholder} 
                    onBlur={(e) => isValid && e.target.value ? setShowError(!isValid(e.target.value)) : null}
                />
            </div>
        </>
    )
}