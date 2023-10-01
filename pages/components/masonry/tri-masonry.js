import React, { useEffect, useRef, useState } from 'react';
import styles from "./masonry.module.css"

const TriMasonryLayout = ({ blocks }) => {
    const [columnOne, setColumnOne] = useState([])
    const [columnTwo, setColumnTwo] = useState([])
    const [columnThree, setColumnThree] = useState([])

    useEffect(() => {
        if (!blocks || blocks.length < 1) return;
        let one = []
        let two = []
        let three = []
        blocks.forEach((block, index) => {
            if (index % 3 === 0) {
                one.push(block);
            } else if (index % 3 === 1) {
                two.push(block);
            } else {
                three.push(block);
            }
        });
        setColumnOne(one);
        setColumnTwo(two);
        setColumnThree(three);
    }, [blocks]);

    return (
        <div className={styles.masonryContainer}>
            <div className={styles.triMasonryColumn}>{columnOne}</div>
            <div className={styles.triMasonryColumn}>{columnTwo}</div>
            <div className={styles.triMasonryColumn}>{columnThree}</div>
        </div>
    );
};

export default TriMasonryLayout;