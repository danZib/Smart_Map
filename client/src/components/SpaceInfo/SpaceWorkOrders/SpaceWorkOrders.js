import React from 'react';
import styles from './SpaceWorkOrders.css';
import WorkOrderItem from './WorkOrderItem/WorkOrderItem';

const spaceWorkOrders = (props) => {

  const workOrderItems = props.workOrders.map((workOrder)=> {
    return (
      <WorkOrderItem title={workOrder.title} id={workOrder.id} hasHotSpot={workOrder.hasHotSpot} handleShowClick={props.handleShowClick}/>
    );
  })
  return (
    <div className={styles.SpaceWorkOrders}>
      <h2>Work Orders</h2>
      <ul className={styles.List}>
        {workOrderItems}
      </ul>
    </div>
  );
}

export default spaceWorkOrders;
