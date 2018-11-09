import React, { Component } from 'react';
import SvgIfcElement from '../../components/SvgIfcElement/SvgIfcElement';
import SvgLayer from '../SvgLayer/SvgLayer';
import styles from './SvgViewPort.css';
import SvgCircle from '../SvgCircle/SvgCircle';

class SvgViewPort extends Component {

  render(){
    const viewBox = this.props.viewBox.join(',');

    const svgLayers = Object.keys(this.props.svgLayers).map((layerType) => {

      const svgIfcElements = this.props.svgLayers[layerType]['elements'].map((ifcElement) => {

        const classes = [ifcElement.ifc_type.slice().replace('Ifc', '')];

        // Find a more effective way of specifically rendering a certain room
        if (ifcElement.global_id === this.props.selectedSpaceId) {
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
    return (
      <svg
        className={styles.SvgViewPort}
        viewBox={viewBox.length === 0 ? [0, 0, 0, 0] : viewBox}>
        {svgLayers}
      </svg>
    );
  };
}

export default SvgViewPort;

