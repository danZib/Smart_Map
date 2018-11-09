import React from 'react';
import styles from './Image.css';

const image = (props) => {
  const {imagePath, alt, fit} = props;
  const image = require(`../../../assets/images/${imagePath}`)

  const classes = [styles.Image, styles[`${fit}`]]
  return (

    <img src={image} alt={alt} className={classes.join(' ')}/>
  );
}
/*

*/
export default image;
