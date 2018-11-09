import React from 'react';
import styles from './ToggleSidebarButton.css';

const toggleSidebarButton = (props) => {
  const classes = [styles.ToggleButton]
  let Icon = require(`react-icons/lib/fa/caret-right`)

  if (props.isOpenSidebar) {
    Icon = require(`react-icons/lib/fa/caret-left`)
    classes.push(styles.Move)
  }

  return (

    <button
      onClick={props.handleClick}
      className={classes.join(' ')}>
      <Icon />
    </button>
  );
}

export default toggleSidebarButton;
