import React from 'react';
import styles from './WorkOrderItem.css';

const workOrderItem = (props) => {

  return(
    <div className={styles.Item}>
      <span>{props.title}</span>
      <button onClick={(e)=>{props.handleShowClick(props.id)}}>View</button>
    </div>
  );
}

export default workOrderItem;

