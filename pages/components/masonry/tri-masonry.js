import React, { useEffect, useRef, useState } from 'react';
import styles from "./masonry.module.css"

const TriMasonryLayout = ({ children }) => {
    const [columnOne, setColumnOne] = useState([])
    const [columnTwo, setColumnTwo] = useState([])
    const [columnThree, setColumnThree] = useState([])

    useEffect(() => {
        let one = []
        let two = []
        let three = []
        React.Children.forEach(children, (child, index) => {
            if (index % 3 === 0) {
                one.push(child);
            } else if (index % 3 === 1) {
                two.push(child);
            } else {
                three.push(child);
            }
        });
        setColumnOne(one);
        setColumnTwo(two);
        setColumnThree(three);
    }, [children]);

    return (
        <div className={styles.masonryContainer}>
            <div className={styles.triMasonryColumn}>{columnOne}</div>
            <div className={styles.triMasonryColumn}>{columnTwo}</div>
            <div className={styles.triMasonryColumn}>{columnThree}</div>
        </div>
    );
};

export default TriMasonryLayout;