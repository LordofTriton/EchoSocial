import React, { useEffect, useState } from 'react';
import styles from './masonry.module.css';

const QuadMasonryLayout = ({ children }) => {
  const [columns, setColumns] = useState([[], [], [], []]);

  useEffect(() => {
    const sortedChildren = React.Children.toArray(children);
    const newColumns = [[], [], [], []];

    sortedChildren.forEach((child, index) => {
      const columnIndex = index % 4;
      newColumns[columnIndex].push(child);
    });

    setColumns(newColumns);
  }, [children]);

  return (
    <div className={styles.masonryContainer}>
      <div className={styles.quadMasonryColumn}>{columns[0]}</div>
      <div className={styles.quadMasonryColumn}>{columns[1]}</div>
      <div className={styles.quadMasonryColumn}>{columns[2]}</div>
      <div className={styles.quadMasonryColumn}>{columns[3]}</div>
    </div>
  );
};

export default QuadMasonryLayout;