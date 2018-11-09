import React from 'react';
import styles from './PanelButton.css';

const panelButton = (props) => {

  const Icon = require(`react-icons/lib/${props.iconName}`)

  let classes = [styles.Button]
  if (props.isDisabled) {
    classes.push(styles.Disabled)
  }
  return(
    <button className={classes.join(' ')} onClick={props.click}>
      <Icon />
      <p style={{}}>{props.text}</p>
    </button>
  );
}

export default panelButton;
