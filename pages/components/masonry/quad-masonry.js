import React, { useEffect, useState } from 'react';
import styles from './masonry.module.css';

const QuadMasonryLayout = ({ blocks }) => {
  const [columns, setColumns] = useState([[], [], [], []]);

  useEffect(() => {
    if (!blocks || blocks.length < 1) return;
    const newColumns = [[], [], [], []];

    blocks.forEach((block, index) => {
      const columnIndex = index % 4;
      newColumns[columnIndex].push(block);
    });

    setColumns(newColumns);
  }, [blocks]);

  return (
    <div className={styles.masonryContainer}>
      <div className={styles.uniMasonryColumn}>{blocks}</div>
      
      <div className={styles.quadMasonryColumn}>{columns[0]}</div>
      <div className={styles.quadMasonryColumn}>{columns[1]}</div>
      <div className={styles.quadMasonryColumn}>{columns[2]}</div>
      <div className={styles.quadMasonryColumn}>{columns[3]}</div>
    </div>
  );
};

export default QuadMasonryLayout;