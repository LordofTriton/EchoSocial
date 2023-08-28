import React, { useEffect, useRef, useState } from 'react';
import styles from "./masonry.module.css"

const DuoMasonryLayout = ({ children }) => {
    const [columnOne, setColumnOne] = useState([])
    const [columnTwo, setColumnTwo] = useState([])

    useEffect(() => {
        let one = []
        let two = []
        React.Children.forEach(children, (child, index) => {
            if (index % 2 === 0) one.push(child);
            else two.push(child);
        });
        setColumnOne(one);
        setColumnTwo(two);
    }, [children]);

    return (
        <div className={styles.masonryContainer}>
            <div className={styles.duoMasonryColumn} style={{float: "left"}}>{columnOne}</div>
            <div className={styles.duoMasonryColumn} style={{float: "right"}}>{columnTwo}</div>
        </div>
    );
};

export default DuoMasonryLayout;