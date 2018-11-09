import React from 'react';

import styles from './StandardButton.css';

const standardButton = (props) => (
    <button
        className={[styles.Button, styles[props.btnType]].join(' ')}
        onClick={props.clicked}>{props.children}</button>
);

export default standardButton;
