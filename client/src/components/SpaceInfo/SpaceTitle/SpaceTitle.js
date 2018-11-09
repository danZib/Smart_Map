import React, { Component } from 'react';
import styles from './SpaceTitle.css';

class spaceTitle extends Component{

  render() {
    const spaceName = this.props.spaceName === '' ? 'Alvar Aalto Room' : this.props.spaceName;
    return (
      <div className={styles.SpaceTitle}>
        <h1>{spaceName}</h1>
      </div>
    );
  }

}

export default spaceTitle;
