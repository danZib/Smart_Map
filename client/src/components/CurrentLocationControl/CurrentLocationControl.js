import React from 'react';
import styles from './CurrentLocationControl.css';

const currentLocationControl = (props) => {

  const controlClasses = [styles.CurrentLocationControl]

  if (props.openSidebar) {
    controlClasses.push(styles.Move);
  }
  const classes = [styles.CurrentLocationButton];

  if (props.show){
    classes.push(styles.Active)
  }

  return (
    <div className={controlClasses.join(' ')}>
      <button
          className={`ui circular icon button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(e)}>
        Show Location
      </button>

    </div>
  );
}

export default currentLocationControl;
