import React from "react";

export default function Loader({size, thickness, color, style}) {
    return(
        <div className="loader" style={{
            width: size,
            height: size,
            borderWidth: thickness,
            borderColor: `${color} transparent`,
            ...style
        }}></div>
    )
}