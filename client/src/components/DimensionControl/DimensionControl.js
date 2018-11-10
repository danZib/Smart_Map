import React from 'react';
import styles from './DimensionControl.css';
import PropTypes from 'prop-types';

const dimensionControl = (props) => {

  const dimensionControlButtons = props.options
    .map((option) => {
      let classes = [styles.DimensionButton]
      if (option === props.dimension) {
        classes.push(styles.Active)
      }

      return (
        <button
          key={option}
          className={`ui circular button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(option, e)}>{option+'D'}</button>
      );
    })

  return(
     <div className={styles.DimensionButtonControl}>
      {dimensionControlButtons}
    </div>
  );
}

dimensionControl.propTypes = {
  dimensionControls: PropTypes.arrayOf(PropTypes.number),
  activeFloor: PropTypes.number
};

export default dimensionControl;
