import React from "react";
import styles from "./form.module.css"

export default function AreaInput({label, style, value, onChange, placeholder}) {
    return (
        <div className={styles.formTextInputField} style={style}>
            <span className={styles.formTextInputFieldLabel}>{label}</span>
            <textarea className={styles.formTextAreaFieldInput} value={value} onChange={onChange} placeholder={placeholder} />
        </div>
    )
}