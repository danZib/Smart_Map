import React from 'react';
import styles from './FloorControl.css';
import PropTypes from 'prop-types';

const floorControl = (props) => {

  const floorLevelButtons = props.floorLevels
    .sort((a, b) => a-b)
    .map((level) => {
      let classes = [styles.LevelButton]
      if (level === props.activeLevel) {
        classes.push(styles.Active)
      }

      return (
        <button
          key={level}
          className={`ui circular button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(level, e)}>{level}</button>
      );
    })

  return(
     <div className={styles.LevelButtonControl}>
      {floorLevelButtons}
    </div>
  );
}

floorControl.propTypes = {
  floorLevels: PropTypes.arrayOf(PropTypes.number),
  activeFloor: PropTypes.number
};

export default floorControl;
