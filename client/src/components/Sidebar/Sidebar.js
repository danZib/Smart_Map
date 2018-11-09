import React from 'react';
import styles from './Sidebar.css';

const sidebar = (props) => {
  let attachedClasses = [styles.Sidebar, styles.Close]

  if(props.open) {
    attachedClasses = [styles.Sidebar, styles.Open]
  }

  return(
    <div className={attachedClasses.join(' ')}>
      {props.children}
    </div>
  );
};

export default sidebar;
