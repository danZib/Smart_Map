import React from 'react';
import styles from './FloorControl.css';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';


class floorControl extends React.Component {

/*
  const floorLevelButtons = props.floorLevels
    .sort((a, b) => a-b)
    .map((level) => {
      
      if (level === props.activeLevel) {
        classes.push(styles.Active)
      }

      return (
        <button
          key={level}
          className={`ui circular button ${classes.join(' ')}`}
          onClick={(e)=> props.handleClick(level, e)}>{level}</button>
      );
    })
    */

  componentDidMount(){

  }

  render(){
    let classes = [styles.LevelButton]
    return(
       <div className={styles.LevelButtonControl}>
        {this.props.building.map((floor, i) => (
            <button
              key={i}
              className={`ui circular button ${classes.join(' ')}`}
              onClick={(e)=> this.props.handleClick(floor.level, e)}>{floor.level}</button>

        ))}
      </div>
    ); 
  }

}

floorControl.propTypes = {
  /*
  floorLevels: PropTypes.arrayOf(PropTypes.number),
  activeFloor: PropTypes.number
  */
};

const mapStateToProps = state => ({
  dimension: state.map.dimension,
  floor: state.map.floor,
  building: state.map.building
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(floorControl);