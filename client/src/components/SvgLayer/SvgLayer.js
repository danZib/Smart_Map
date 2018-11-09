import React from 'react';
import styles from './SvgLayer.css';

const svgLayer = (props) => {

  const styleClasses = [styles[props.styleClass]]

  if (props.isTransparent) {
    styleClasses.push(styles.Transparent)
  }
  return (
    <g className={styleClasses.join(' ')}>
      {props.children}
    </g>
  );
}

export default svgLayer;
