import React, { useState } from "react";
import styles from "./form.module.css"

export default function SwitchInput({style, value, onChange}) {
    const handleClick = () => {
        onChange(!value)
    }

    return (
        <div className={styles.formSwitch} style={{...style, backgroundColor: value ? "var(--accent)" : "var(--primary)"}} onClick={() => handleClick()}>
            <div className={styles.formSwitchKey} style={{float: value ? "right" : "left"}}></div>
            <span className={styles.formSwitchState} style={value ? {left: "10px"} : {right: "10px"}}>{value ? "ON" : "OFF"}</span>
        </div>
    )
}