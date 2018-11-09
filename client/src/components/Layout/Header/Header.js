import React from 'react';

import styles from './Header.css';

const header = (props) => {

  // const logo = require('../../../assets/images/logo/smart_map.png');

  return (
      <div className={`ui menu ${styles.Header}`}>
        <div
          className='item'>
          <h3>Smart<span className={styles.lighter}>Map</span></h3>
        </div>
        <div className='right menu'>
          <div className='item'>
            <button className='ui primary button'>
              Sign Up
            </button>
          </div>
        </div>
      </div>
  );
}

export default header;
