import React, { Component } from 'react';
import styles from './SvgIfcElement.css';



class svgIfcElement extends Component {

  // shouldComponentUpdate(prevState) {
  //   const shouldUpdate = !(this.props.guid === prevState.guid);
  //   return shouldUpdate;
  // }
  render() {
    const {path, guid, type, classes} = this.props;
    const styleClasses = classes.map((styClass) => {
     if (styles[styClass]) {
        return styles[styClass]
      } else {
        return '';
      }
    })
    return (
      <g
        className={styleClasses.join(' ')}
        id={guid}
        type={type}
        onClick={()=> this.props.clicked(guid)}>
        <path key={guid} d={path}/>
      </g>
    );
  }

}

export default svgIfcElement;
