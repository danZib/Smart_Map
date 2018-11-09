import React from 'react';
import styles from './SpaceVentilation.css';

const spaceVentilation = (props) => {

  return (
    <div className={styles.SpaceVentilation}>
      <h2>Ventilation</h2>
      <div className={styles.Row}>
        <span>Supply Air:</span>
        <div className={styles.ButtonGroup}>
          <button onClick = {(e)=> props.handleShowClick('Ventilation','Supply Air', 'supply', e)}
                className={props.subSystems.includes('Supply Air') ? styles.ActiveButton : ''}>Show</button>
        </div>

      </div>
      <div className={styles.Row}>
        <span>Return Air:</span>
        <div className={styles.ButtonGroup}>
          <button onClick = {(e)=> props.handleShowClick('Ventilation', 'Return Air', 'return', e)}
                className={props.subSystems.includes('Return Air') ? styles.ActiveButton : ''}>Show</button>
        </div>
      </div>
    </div>
  );
}

export default spaceVentilation;
