import React from "react";
import styles from "./form.module.css"

export default function TextInput({type, label, style, value, onChange, placeholder}) {
    return (
        <div className={styles.formTextInputField} style={style}>
            <span className={styles.formTextInputFieldLabel}>{label}</span>
            <input type={type? type : "text"} className={styles.formTextInputFieldInput} value={value} onChange={onChange} placeholder={placeholder} />
        </div>
    )
}