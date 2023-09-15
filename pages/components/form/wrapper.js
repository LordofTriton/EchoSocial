import React from "react";
import styles from "./form.module.css"

export default function FullWrapper({children}) {
    return (
        <div className={styles.formFullWrapper}>
            { ...children }
        </div>
    )
}

export function HalfWrapper({children}) {
    return (
        <div className={styles.formHalfWrapper}>
            { ...children }
        </div>
    )
}

export function ThirdWrapper({children}) {
    return (
        <div className={styles.formThirdWrapper}>
            { ...children }
        </div>
    )
}