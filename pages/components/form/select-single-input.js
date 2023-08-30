import React, { useEffect, useState } from "react";
import styles from "./form.module.css"

import SVGServer from "../../../services/svg/svgServer";

export default function SelectSingleInput({label, style, value, setValue, options}) {
    const [showDrop, setShowDrop] = useState(false)

    useEffect(() => {
        setValue(options[0].value)
    }, [])

    const handleOptionClick = (option) => {
        setValue(option.value)
        setShowDrop(false)
    }

    return (
        <div className={styles.formSelectInputField} style={{...style, borderRadius: showDrop ? "5px 5px 0px 0px" : null}}>
            <span className={styles.formTextInputFieldLabel}>{label}</span>
            <div className={styles.formSelectSingleSelected} onClick={() => setShowDrop(!showDrop)}>
                <span className={styles.formSelectSingleSelectedItem}>{value}</span>
                <span className={styles.formSelectSingleSelectedArrow}><SVGServer.ArrowRight color="var(--primary)" width="20px" height="20px" /></span>
            </div>
            {
                showDrop ?
                <div className={styles.formSelectDropDown}>
                    {
                        options.map((option, index) =>
                            <span key={index} className={styles.formSelectOption} onClick={() => handleOptionClick(option)}>{option.label}</span>
                        )
                    }
                </div> : null
            }
        </div>
    )
}