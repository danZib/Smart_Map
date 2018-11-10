import React from 'react';
import styles from './MultipleControl.css';
import PropTypes from 'prop-types';

const multipleControl = (props) => {
  const Hamburger = require('react-icons/lib/fa/bars');
  let classes = [styles.MultipleButton]
  return(
     <div className={styles.MultipleButtonControl}>
        <button
          className={`ui circular button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(e)}>
          <Hamburger/>
          </button>
    </div>
  );
}
;

export default multipleControl;