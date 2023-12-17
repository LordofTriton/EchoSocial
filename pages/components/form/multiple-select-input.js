import React, { useState, useEffect } from "react";
import styles from "./form.module.css"

import SVGServer from "../../../services/svg/svgServer";

export default function SelectMultipleInput({label, style, defaultValue, onAdd, onRemove, options, isValid, error}) {
    const [showDrop, setShowDrop] = useState(false)
    const [selectOptions, setSelectOptions] = useState("")
    const [selected, setSelected] = useState([])

    useEffect(() => {
        if (JSON.stringify(options) === selectOptions) return;
        setSelectOptions(JSON.stringify(options))

        if (defaultValue && defaultValue.length > 0) {
            const preselected = options.filter((option) => defaultValue.includes(option.value))
            setSelected(preselected)
            if (preselected.length > 0) {
                for (let item of preselected) {
                    onAdd(item.value)
                }
            }
        }
    }, [defaultValue, options])

    useEffect(() => {
        if (JSON.stringify(options) === selectOptions) return;
        setSelectOptions(JSON.stringify(options))

        if (options.length > 0 && (!defaultValue || defaultValue.length < 1 || options.filter((option) => defaultValue.includes(option.value)).length < 1)) {
            setSelected([options[0]])
            onAdd(options[0].value)
        }
    }, [options])

    const handleOptionClick = (option) => {
        if (!selected.find((item) => item.value === option.value)) {
            setSelected(selected.concat(option))
            onAdd(option.value)
        }
    }

    const handleSelectedClick = (item, index) => {
        onRemove(item.value)
        setSelected(selected.filter((obj, objIndex) => objIndex !== index))
    }

    return (
        <>
            <div className={styles.formSelectInputField} style={{...style, borderRadius: showDrop ? "5px 5px 0px 0px" : null, cursor: "pointer", height: "80px", marginBottom: showDrop ? "0px" : "20px"}} onClick={() => setShowDrop(!showDrop)}>
                <span className={styles.formTextInputFieldLabel}>
                    {label}
                    {selected.length < 1 ? <span className={styles.formErrorMessage}>({error ?? "Select at least one."})</span> : null}
                </span>
                <div className={styles.formSelectMultipleSelected}>
                    <div style={{display: "inline-block"}}>
                    {
                        selected.length ?
                        selected.map((item, index) =>
                        <span className={styles.formSelectMultipleSelectedItem} key={index}>
                            {item.label}
                            <span onClick={() => handleSelectedClick(item, index)}><SVGServer.CloseIcon color="var(--secondary)" width="20px" height="20px" /></span>
                        </span>
                        ) : null
                    }
                    </div>
                </div>
            </div>
            {
                showDrop ?
                <div className={styles.formSelectDropDown}>
                    <span style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: "500",
                        textTransform: "uppercase",
                        padding: "5px 10px",
                        color: "var(--accent)"
                    }}>
                        Select {label}
                        <span style={{float: "right", cursor: "pointer"}} onClick={() => setShowDrop(false)}>Close</span>
                    </span>
                    {
                        options.map((option, index) =>
                            <span key={index} className={styles.formSelectMultipleSelectedItem} style={{
                                margin: "10px", 
                                display: "block", 
                                backgroundColor: selected.find((item) => item.label === option.label) ? "var(--accent)" : "var(--base)", 
                                color: selected.find((item) => item.label === option.label) ? "var(--surface)" : "var(--primary)"
                            }} onClick={() => handleOptionClick(option)}>{option.label}</span>
                        )
                    }
                </div> : null
            }
        </>
    )
}