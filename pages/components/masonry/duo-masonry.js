import React, { useEffect, useRef, useState } from 'react';
import styles from "./masonry.module.css"

const DuoMasonryLayout = ({ blocks }) => {
    const [columnOne, setColumnOne] = useState([])
    const [columnTwo, setColumnTwo] = useState([])

    useEffect(() => {
        if (!blocks || blocks.length < 1) return;
        let one = []
        let two = []
        blocks.forEach((block, index) => {
            if (index % 2 === 0) one.push(block);
            else two.push(block);
        });
        setColumnOne(one);
        setColumnTwo(two);
    }, [blocks]);

    return (
        <div className={styles.masonryContainer}>
            <div className={styles.duoMasonryColumn} style={{float: "left"}}>{columnOne}</div>
            <div className={styles.duoMasonryColumn} style={{float: "right"}}>{columnTwo}</div>
        </div>
    );
};

export default DuoMasonryLayout;