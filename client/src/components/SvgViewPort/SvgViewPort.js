import React, { Component } from 'react';
import {connect} from 'react-redux';

import SvgIfcElement from '../../components/SvgIfcElement/SvgIfcElement';
import SvgLayer from '../SvgLayer/SvgLayer';
import styles from './SvgViewPort.css';
import SvgCircle from '../SvgCircle/SvgCircle';
import SvgArrow from '../SvgArrow/SvgArrow';

class SvgViewPort extends Component {

  render(){

    const {selectedSpaceId, routeCoordinates}  = {...this.props};
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
      console.log(routeCoordinates);
      for(let i = 0; i < routeCoordinates.length - 1; i++){
        if(this.props.svgLayers.Floorplan.level === routeCoordinates[i].level){
          svgArrows.push(
            <SvgArrow
            last={i == routeCoordinates.length-2}
            key={i}
            x0={routeCoordinates[i].x}
            y0={routeCoordinates[i].y}
            x1={routeCoordinates[i + 1].x}
            y1={routeCoordinates[i + 1].y}
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
    return (
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

const mapStateToProps = state => ({
  path: state.map.path
});

const mapDispatchToProps = dispatch => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvgViewPort);

