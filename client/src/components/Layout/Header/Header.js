import React from 'react';

import styles from './Header.css';

const header = (props) => {

  const logo = require('../../../assets/images/logo/visualynk_logo.png');
  const Icon = require(`react-icons/lib/fa/bars`)
  return (
      <div className={`ui menu ${styles.Header}`}>
        <div
          className='item'
          onClick={props.onToggleSideBar}>
          <img src={logo}/>
        </div>
        <div className='right menu'>
          <div className='item'>
            <button className='ui primary button' role='button'>
              Sign Up
            </button>
          </div>
        </div>
      </div>
  );
}

export default header;
