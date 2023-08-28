import React, { useState, useEffect } from "react";
import styles from "./form.module.css"

import SVGServer from "../../../services/svg/svgServer";

export default function SelectMultipleInput({label, style, onAdd, onRemove, options}) {
    const [showDrop, setShowDrop] = useState(false)
    const [selected, setSelected] = useState([])

    // useEffect(() => {
    //     if (options && options.length > 0) {
    //         onAdd(options[0].value)
    //         setSelected(options.length > 0 ? [options[0]] : [])
    //     }
    // }, [options])

    const handleOptionClick = (option, index) => {
        if (!selected.find((item, itemIndex) => itemIndex === index)) {
            setSelected(selected.concat(option))
            onAdd(option.value)
        }
        setShowDrop(false)
    }

    const handleSelectedClick = (item, index) => {
        onRemove(item.value)
        setSelected(selected.filter((obj, objIndex) => objIndex !== index))
    }

    return (
        <div className={styles.formSelectInputField} style={{...style, borderRadius: showDrop ? "5px 5px 0px 0px" : null, cursor: "pointer", height: "80px"}}>
            <span className={styles.formTextInputFieldLabel}>{label}</span>
            <div className={styles.formSelectMultipleSelected} onClick={() => !showDrop ? setShowDrop(true) : null}>
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
            {
                showDrop ?
                <div className={styles.formSelectDropDown}>
                    {
                        options.map((option, index) =>
                            <span key={index} className={styles.formSelectMultipleSelectedItem} style={{margin: "10px", minWidth: "calc(50% - 20px)", backgroundColor: "var(--accent)"}} onClick={() => handleOptionClick(option, index)}>{option.label}</span>
                        )
                    }
                </div> : null
            }
        </div>
    )
}