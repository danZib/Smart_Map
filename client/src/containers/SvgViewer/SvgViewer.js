import React, { Component } from 'react';
import {connect} from 'react-redux';

import SvgViewPort from '../../components/SvgViewPort/SvgViewPort';
import FloorControl from '../../components/FloorControl/FloorControl';
import DimensionControl from '../../components/DimensionControl/DimensionControl';
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
      floor: {'level': NaN, 'elements': [], 'viewBox': []},
      openSidebar: false,
      currentLocation: {'show': false, 'x':NaN, 'y':NaN},
      selectedSpace: {'attributes': {}, 'globalId': '', 'subSystems': [], 'workOrders': []},
      openPanoramaViewer: false,
      photoSphere: {},
      loading: false,
      levels: [],
      routeCoordinates: []
    }
  }

  componentDidMount() {
    console.log(this.props);

    this.props.getBuilding();

    axios.get(`/storey/`)
      .then((response) => {
        const newLevels = response.data.map((storey) => storey['_level']);
        this.setState({levels: newLevels})
      })
  }

  initCurrentLocation(show=false, x=NaN, y=NaN) {
    return {'show': show, 'x': x, 'y': y}
  }

  initSelectedSpace(attributes ={}, subSystems=[], workOrders=[]) {
    let globalId = '';
    if (Object.keys(attributes).length > 0) {
      globalId = attributes['ifc_global_id'];
    }
    return {'attributes': attributes, 'globalId': globalId}
  }

  resetViewer() {
    const selectedSpace = this.initSelectedSpace();
    const currentLocation = this.initCurrentLocation();

     this.setState({floor: {'level': NaN, 'elements': [], 'viewBox': []}, currentLocation: currentLocation, selectedSpace: selectedSpace, openSidebar: false, routeCoordinates: []});
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
    if (level === this.state.floor['level']){
      this.resetViewer()
      return;
    }

    axios.get(`/storey/${level}/svg`)
    .then((floorplanRes) => {
      const newElements = floorplanRes.data.elements
      const newViewBox = floorplanRes.data.viewBox
      const newFloor =  {'level': level, 'elements': newElements, 'viewBox': newViewBox};
      this.setState((prevState) => {
        const selectedSpace = this.initSelectedSpace()
        return { floor: newFloor, selectedSpace: selectedSpace, openSidebar: false}
      });
    })
    .catch((err) => {
      console.log(err);
    })
  }

  selectDimension = (dimension, e) => {
    this.props.setDimension(dimension);
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

    if (this.state.selectedSpace.globalId === spaceGuid) {
      const selectedSpace = this.initSelectedSpace()
      this.setState({openSidebar: false, selectedSpace: selectedSpace});
      return;
    }

    axios.get(`/storey/${this.state.floor['level']}/space/${spaceGuid}`)
    .then((spaceRes) => {
      const selectedSpace = this.initSelectedSpace(spaceRes.data);
      this.setState({openSidebar: true, selectedSpace: selectedSpace});
    })
    .catch((err) => {
      console.log(err);
    })
  }

  viewSpacePanoramaHandler = async (e) => {

    const newPhotoSphere = await this.getSpacePanorama();

    this.setState({openPanoramaViewer: !this.state.openPanoramaViewer, photoSphere: newPhotoSphere})
  }

  viewSpaceRouteHandler = (e) => {
    this.setState((prevState) => {
      return {routeCoordinates: [{'x': 1.5, 'y': 16.0}, {'x': 3.5, 'y': 16.0}, {'x': 3.5, 'y': 12.0}]}
    })
  }


  closePanoramaViewerHandler = () => {
    this.setState({openPanoramaViewer: false})
  }

  // Render //////////////////////////////////////////////////////////
  render() {
    const {floor, openSidebar, selectedSpace, photoSphere, openPanoramaViewer, loading, levels, currentLocation, routeCoordinates}  = {...this.state};

    let spinner = isNaN(floor['level']) && loading ? <div className={styles.Spinner}><Spinner/></div> : null;

    let svgLayers = !isNaN(floor['level']) ? {'Floorplan': {'elements': floor['elements'].slice(),'isTransparent': false,'exceptions': []}} : {};

    let spaceSidebarContent = null;

    if (selectedSpace.globalId !== '') {
      spaceSidebarContent = (
        <SpaceInfo
          space={selectedSpace}
          handleSpacePanoramaClick={this.viewSpacePanoramaHandler}
          handleSpaceRouteClick={this.viewSpaceRouteHandler}/>
      );
    }

    return (
      <div className={styles.SvgViewer}>
        {spinner}
        <Modal show={openPanoramaViewer} handleModelCloseClick={this.closePanoramaViewerHandler} width={'80%'} height={'80%'}>
          {openPanoramaViewer ? <PanoramaViewer globalId={selectedSpace.globalId} {...photoSphere}/> : null}
        </Modal>
        <Sidebar open={openSidebar}>
           {spaceSidebarContent}
        </Sidebar>
        <div className="map-wrapper">
          <SvgViewPort
            dimension={this.props.dimension}
            viewBox={floor['viewBox']}
            svgLayers={svgLayers}
            handleClickOnSpace={this.selectSpaceHandler}
            selectedSpaceId={selectedSpace ? selectedSpace.globalId : ''}
            currentLocation={currentLocation}
            routeCoordinates={routeCoordinates}/>
        </div>
        <FloorControl
          floorLevels={levels}
          activeLevel={floor['level']}
          handleClick={this.selectFloorHandler}/>
        <DimensionControl
          options={[2,3]}
          dimension={this.props.dimension}
          handleClick={this.selectDimension}/>
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
  dimension: state.map.dimension
});

const mapDispatchToProps = dispatch => ({
  getBuilding: mapActions.getBuilding(dispatch),
  setDimension: mapActions.setDimension(dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SvgViewer);