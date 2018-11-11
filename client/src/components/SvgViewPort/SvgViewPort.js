import React, { Component } from 'react';
import {connect} from 'react-redux';

import SvgIfcElement from '../../components/SvgIfcElement/SvgIfcElement';
import SvgLayer from '../SvgLayer/SvgLayer';
import styles from './SvgViewPort.css';
import SvgCircle from '../SvgCircle/SvgCircle';
import SvgArrow from '../SvgArrow/SvgArrow';

class SvgViewPort extends Component {

  render(){

    const {selectedSpaceId}  = {...this.props};
    const viewBox = this.props.viewBox.join(',');

    const svgLayers = Object.keys(this.props.svgLayers).map((layerType) => {

      const svgIfcElements = this.props.svgLayers[layerType]['elements'].map((ifcElement) => {
        const classes = [ifcElement.ifc_type.slice().replace('Ifc', '')];
        // Find a more effective way of specifically rendering a certain room
        if (ifcElement.global_id === selectedSpaceId) {
          classes.push('SelectedSpace')
        }
        if (this.props.svgLayers[layerType]['isTransparent'] && !(this.props.svgLayers[layerType]['exceptions'].includes(ifcElement.global_id))) {
          classes.push('Transparent')
        }
        /*
        TODO: highlight doors or spaces?
        if(this.props.path && ifcElement.ifc_type =='IfcDoor'){
          if(JSON.stringify(this.props.path).indexOf(ifcElement.global_id) > -1){
            classes.push('Marked')
          }
        }
        */
        //if(this.props.path && ifcElement.ifc_type =='IfcSpace')
        return(
          <SvgIfcElement
            key={ifcElement.global_id}
            guid={ifcElement.global_id}
            type={ifcElement.ifc_type}
            path={ifcElement.svg_path}
            clicked={ifcElement.ifc_type === 'IfcSpace' ? this.props.handleClickOnSpace : ()=>{}}
            classes={classes} />
        )
      })
      return (
        <SvgLayer
          key = {layerType}
          styleClass={layerType}
          isTransparent={this.props.svgLayers[layerType]['isTransparent']}>
          {svgIfcElements}
        </SvgLayer>
      );
    });

    if (this.props.currentLocation.show) {
      svgLayers.push(
        <SvgLayer
          key="currentLocation"
          styleClass=''
          isTransparent={false}>
          <SvgCircle x={this.props.currentLocation.x} y={this.props.currentLocation.y} radius={0.5} color="red" />
        </SvgLayer>
      )
    }

    if (this.props.path && this.props.path.length > 0) {
      const svgArrows = []
      let routeCoordinates = this.props.path;
      for(let i = 0; i < routeCoordinates.length - 1; i++){
        if(this.props.svgLayers.Floorplan.level === routeCoordinates[i].level){
          //let bezier = bezierCommand([routeCoordinates[i].x, routeCoordinates[i].y], i, routeCoordinates);
          //console.log(bezier);
          svgArrows.push(
            <SvgArrow
            last={i === routeCoordinates.length-2}
            key={i}
            x0={routeCoordinates[i].x}
            y0={routeCoordinates[i].y}
            x1={routeCoordinates[i + 1].x}
            y1={routeCoordinates[i + 1].y}
            //bezier={bezier}
            color='red'/>
          )
        }

      }
      svgLayers.push(
        <SvgLayer
          key="path"
          styleClass=''
          isTransparent={false}>
          {svgArrows}
        </SvgLayer>
      )
    }

    const classes = [styles.SvgViewPort];

    let divStyle = {}

    if(this.props.dimension===3 && this.props.multiple){
      //translateY('+this.props.svgLayers.Floorplan.level*200+'px)
      divStyle = {
        transform: 'perspective(1500px) rotateX(65deg) translateZ('+this.props.svgLayers.Floorplan.level*300+'px)'
      };
    }

    if(this.props.dimension===3) classes.push(styles.skew);
    
    /*
    
    if(this.props.routeCoordinates){
      let points = this.props.routeCoordinates;
      d = points.reduce((acc, point, i, a) => i === 0
      ? `M ${point[0]},${point[1]}`
      : `${acc} ${bezierCommand(point, i, a)}`
      , '');  
    }
    */
    let d = [];
    if(this.props.routeCoordinates){
      let routeCoordinates = this.props.routeCoordinates;
      for(let i = 0; i < routeCoordinates.length - 1; i++){
        if(i === 0){
          d.push(`M ${routeCoordinates[i].x},${routeCoordinates[i].y}`)
        }else{
          d.push(`${bezierCommand([routeCoordinates[i].x, routeCoordinates[i].y], i, routeCoordinates)}`)
        }
      }
    }

    console.log("*''***************'")
    console.log(d);
    return(
      <div className="map-container">
        <svg
          className={classes.join(' ')}
          style={divStyle}
          viewBox={viewBox.length === 0 ? [0, 0, 0, 0] : viewBox}>
          {svgLayers}
        </svg>
      <div id="clear" style={{clear:"both"}}></div>
      </div>
    );
  };
}

const line = (pointA, pointB) => {
  const lengthX = pointB[0] - pointA[0]
  const lengthY = pointB[1] - pointA[1]
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

//[x, y], [x, y], [x, y]
const controlPoint = (current, previous, next) => {
  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  const p = previous || current
  const n = next || current
  // The smoothing ratio
  const smoothing = 0.2
  // Properties of the opposed-line
  const o = line(p, n)
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle
  const length = o.length * smoothing
  // The control point position is relative to the current point
  const x = current[0] + Math.cos(angle) * length
  const y = current[1] + Math.sin(angle) * length
  return [x, y]
}

//[x, y], index, [[x, y]]
const bezierCommand = (point, i, a) => {
  // start control point
  const cps = controlPoint([a[i-1].x, a[i-1].y],[a[i-2].x, a[i-2].y], point)

  // end control point
  const cpe = controlPoint(point,[a[i-1].x, a[i-1].y],[a[i+1].x, a[i+1].y])
  console.log(cpe);
  return `C ${cps[0]} ${cps[1]}, ${cpe[0]} ${cpe[1]}, ${point[0]} ${point[1]}`
}

const mapStateToProps = state => ({
  path: state.map.path
});

const mapDispatchToProps = dispatch => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvgViewPort);

