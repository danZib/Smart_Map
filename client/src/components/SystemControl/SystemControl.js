import React from 'react';
import PropTypes from 'prop-types';
import styles from './SystemControl.css';

const systemControl = (props) => {
  const controlClasses = [styles.SystemButtonControl]

  if (props.openSidebar) {
    controlClasses.push(styles.Move)
  }
  const systemButtons = props.systemTypes
    .sort((typeA,typeB) => typeA > typeB)
    .map((sysType) => {
      const classes = [styles.SystemButton]

      if (props.activeSystems.includes(sysType)) {
        classes.push(styles.Active)
      }
      return (
        <button
          className={`ui circular icon button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(sysType, e)}
          key={sysType}>{sysType}</button>
      );
    });

  return (
    <div className={controlClasses.join(' ')}>
      {systemButtons}
    </div>
  );
};

systemControl.propTypes = {
  systemTypes: PropTypes.array
};

export default systemControl;
