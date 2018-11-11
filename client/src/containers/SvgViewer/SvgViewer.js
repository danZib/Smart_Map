import React, { Component } from 'react';
import {connect} from 'react-redux';

import SvgViewPort from '../../components/SvgViewPort/SvgViewPort';
import FloorControl from '../../components/FloorControl/FloorControl';
import DimensionControl from '../../components/DimensionControl/DimensionControl';
import MultipleControl from '../../components/MultipleControl/MultipleControl';
import Sidebar from '../../components/Sidebar/Sidebar';
import SpaceInfo from '../../components/SpaceInfo/SpaceInfo';
import Modal from '../../components/UI/Modal/Modal';
import PanoramaViewer from '../../components/PanoramaViewer/PanoramaViewer';
import Spinner from '../../components/UI/Spinner/Spinner';
import CurrentLocationControl from '../../components/CurrentLocationControl/CurrentLocationControl';
import styles from './SvgViewer.css';
import axios from '../../axios-office-building';
import ToggleSidebarButton from '../../components/UI/Buttons/ToggleSidebarButton/ToggleSidebarButton';

import * as mapActions from '../../actions/mapActions';

class SvgViewer extends Component {
  // General /////////////////////////////////////////////////////////

  constructor(props){
    super(props);
    this.state = {
      openSidebar: false,
      currentLocation: {'show': false, 'x':NaN, 'y':NaN},
      selectedSpace: {'attributes': {}, 'globalId': '', 'subSystems': [], 'workOrders': []},
      openPanoramaViewer: false,
      photoSphere: {},
    }
  }

  componentDidMount() {
    this.props.getBuilding();
  }

  initCurrentLocation(show=false, x=NaN, y=NaN) {
    return {'show': show, 'x': x, 'y': y}
  }

  initSelectedSpace(attributes ={}) {
    let globalId = '';
    if (Object.keys(attributes).length > 0) {
      globalId = attributes['ifc_global_id'];
    }
    return {'attributes': attributes, 'globalId': globalId}
  }

  resetViewer() {
    const selectedSpace = this.initSelectedSpace();
    const currentLocation = this.initCurrentLocation();
    this.setState({floor: {'level': NaN, 'elements': [], 'viewBox': []}, currentLocation: currentLocation, selectedSpace: selectedSpace, openSidebar: false});
  }

  getSpacePanorama() {
    return new Promise( async (resolve, reject) => {
      const photoSphereRes = await axios.get(`/storey/${this.state.floor['level']}/space/${this.state.selectedSpace.globalId}/photospheres`)
        .catch((err) => { reject(err); });

      const newPhotoSphere = photoSphereRes.data;

      resolve(newPhotoSphere)
    })
  }

  // Handlers ////////////////////////////////////////////////////////

  selectFloorHandler = (level, e) => {
    if(level !== this.props.floor) this.props.setFloor(level);
  }

  selectDimension = (dimension, e) => {
    if(dimension !== this.props.dimension) this.props.setDimension(dimension);
    if(dimension !== 3) this.props.setMultiple(false);
  }

  setMultiple = (e) => {
    this.props.setMultiple(!this.props.multiple);
  }

  toggleSidebarHandler = (e) => {
    this.setState((prevState) => {
      return {openSidebar: !prevState.openSidebar}
    })
  }

  showCurrentLocationHandler = (e) => {
    this.setState((prevState) => {
      let newCurrentLocation = this.initCurrentLocation(false)
      if (!prevState.currentLocation.show){
        // TODO a call to database
        newCurrentLocation = this.initCurrentLocation(true, 1.5, 16.0)
      }
      return {currentLocation: newCurrentLocation}
    })
  }

  selectSpaceHandler = (spaceGuid, e) => {
    if(this.props.currentSpace == null || this.props.currentSpace.globalId !== spaceGuid){
      this.props.setCurrentSpace(spaceGuid);
      this.setState({openSidebar: true});
    } 
    else if (this.props.currentSpace.globalId === spaceGuid) {
      this.props.setCurrentSpace(null);
      this.setState({openSidebar: false});
    }
  }

  viewSpacePanoramaHandler = async (e) => {
    const newPhotoSphere = await this.getSpacePanorama();
    this.setState({openPanoramaViewer: !this.state.openPanoramaViewer, photoSphere: newPhotoSphere})
  }

  viewSpaceRouteHandler = (e) => {
    this.props.findPath('06njXbG3HC4RydTXssDqYp', this.props.currentSpace.data.ifc_global_id);
  }

  closePanoramaViewerHandler = () => {
    this.setState({openPanoramaViewer: false})
  }

  render() {
    //Return early if loading
    if(!this.props.building){
      return(
        <div className={styles.Spinner}><Spinner/></div>
        )
    }

    const {openSidebar, selectedSpace, photoSphere, openPanoramaViewer, currentLocation, routeCoordinates}  = {...this.state};
    let elements = {}
    let svgLayers = [];

    if(this.props.multiple){
      this.props.building.map((floor, i) => {
        elements = floor.elements;
        svgLayers.push({'Floorplan': {elements, 'isTransparent': false, 'exceptions': [], level:floor.level}})
      });
    }else{
      elements = this.props.building[this.props.floor].elements;
      svgLayers.push({'Floorplan': {elements, 'isTransparent': false, 'exceptions': [], level:this.props.building[this.props.floor].level}})
    }

    let spaceSidebarContent = null;

    if (this.props.currentSpace.globalId !== '') {
      spaceSidebarContent = (
        <SpaceInfo
          space={this.props.currentSpace.data}
          handleSpacePanoramaClick={this.viewSpacePanoramaHandler}
          handleSpaceRouteClick={this.viewSpaceRouteHandler}/>
      );
    }

    return (
      <div className={styles.SvgViewer}>
        <Modal show={openPanoramaViewer} handleModelCloseClick={this.closePanoramaViewerHandler} width={'80%'} height={'80%'}>
          {openPanoramaViewer ? <PanoramaViewer globalId={selectedSpace.globalId} {...photoSphere}/> : null}
        </Modal>
        <Sidebar open={openSidebar}>
           {spaceSidebarContent}
        </Sidebar>
        <div className="map-wrapper">
        {
          svgLayers.map((layer, i) =>{
            return(
            <SvgViewPort
              key={i}
              dimension={this.props.dimension}
              multiple={this.props.multiple}
              viewBox={this.props.building[this.props.floor].viewBox}
              svgLayers={layer}
              handleClickOnSpace={this.selectSpaceHandler}
              selectedSpaceId={selectedSpace ? selectedSpace.globalId : ''}
              currentLocation={currentLocation}
              routeCoordinates={routeCoordinates}/>
          )
          })
        }
        </div>

        <FloorControl
          handleClick={this.selectFloorHandler}/>
        <DimensionControl
          options={[2,3]}
          dimension={this.props.dimension}
          multiple={this.props.multiple}
          handleClick={this.selectDimension}/>
        {this.props.dimension === 3 &&
          <MultipleControl
            multiple={this.props.multiple}
            handleClick={this.setMultiple}/>
        }
        <ToggleSidebarButton
          handleClick={this.toggleSidebarHandler}
          isOpenSidebar={openSidebar}/>
        <CurrentLocationControl
          handleClick={this.showCurrentLocationHandler}
          openSidebar={openSidebar}
          show={currentLocation.show}/>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  dimension: state.map.dimension,
  floor: state.map.floor,
  multiple: state.map.multiple,
  building: state.map.building,
  currentSpace: state.map.space,
  path: state.map.path
});

const mapDispatchToProps = dispatch => ({
  getBuilding: mapActions.getBuilding(dispatch),
  setFloor: mapActions.setFloor(dispatch),
  setMultiple: mapActions.setMultiple(dispatch),
  setDimension: mapActions.setDimension(dispatch),
  setCurrentSpace: mapActions.setCurrentSpace(dispatch),
  findPath: mapActions.findPath(dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvgViewer);
