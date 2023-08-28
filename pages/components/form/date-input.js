import React from "react";
import styles from "./form.module.css"

export default function DateInput({label, style, value, onChange}) {
    return (
        <div className={styles.formTextInputField} style={style}>
            <span className={styles.formTextInputFieldLabel}>{label}</span>
            <input type="date" className={styles.formTextInputFieldInput} value={value} onChange={onChange} />
        </div>
    )
}