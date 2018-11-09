import React from 'react';
import styles from './SpaceAttributes.css';
import * as Utils from '../../../utils';

const spaceAttributes = (props) => {

  const attributesElements = Object.keys(props.space)
    .map((key) => {
      let value = props.space[key];
      let newKey = Utils.dbKeyToDisplayString(key);

      if (Utils.isFloat(value)) {
        value = Utils.roundFloat(value, 2);
      }

      if (value === '') {
        value = '-'
      }
      return (
        <li key={newKey}><span>{newKey}:</span><span>{value}</span></li>
      );
    })
  return (
    <div className={styles.SpaceAttributes}>
      <h2>Attributes</h2>
      <ul className={styles.List}>
        {attributesElements}
      </ul>
    </div>
  );
}

export default spaceAttributes;
