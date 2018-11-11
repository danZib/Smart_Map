import React from 'react';
import styles from './AlgoControl.css';
import PropTypes from 'prop-types';

const algoControl = (props) => {
  const algoControlButtons = props.options
    .map((option) => {
      let classes = [styles.AlgoButton]
      if (option === props.algo) {
        classes.push(styles.Active)
      }

      return (
        <button
          key={option}
          className={`ui circular button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(option, e)}>{option}</button>
      );
    })

  return(
     <div className={styles.AlgoButtonControl}>
      {algoControlButtons}
    </div>
  );
}

algoControl.propTypes = {
  dimensionControls: PropTypes.arrayOf(PropTypes.number),
  activeFloor: PropTypes.number
};

export default algoControl;