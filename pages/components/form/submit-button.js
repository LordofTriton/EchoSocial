import React from "react";
import styles from "./form.module.css"

export default function Submit({style, text, loader, onClick, disabled}) {
    return (
        <button className={styles.formSubmit} style={style ? {...style, opacity: disabled ? "0.5" : "1"} : { opacity: disabled ? "0.1" : "1"} } onClick={() => onClick && !disabled ? onClick() : null}>{ 
            loader ? <center><div className="loader" style={{
                height: "70%", 
                maxHeight: "30px",
                aspectRatio: 1,
                margin: "auto auto"
            }}></div></center> : text 
        }</button>
    )
}