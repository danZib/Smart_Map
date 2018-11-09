import React, { Component } from 'react';
import SvgViewPort from '../../components/SvgViewPort/SvgViewPort';
import FloorControl from '../../components/FloorControl/FloorControl';
import Sidebar from '../../components/Sidebar/Sidebar';
import SpaceInfo from '../../components/SpaceInfo/SpaceInfo';
import Modal from '../../components/UI/Modal/Modal';
import PanoramaViewer from '../../components/PanoramaViewer/PanoramaViewer';
import Spinner from '../../components/UI/Spinner/Spinner';

import styles from './SvgViewer.css';
import axios from '../../axios-office-building';
import ToggleSidebarButton from '../../components/UI/Buttons/ToggleSidebarButton/ToggleSidebarButton';
class SvgViewer extends Component {


  state = {
    floor: {'level': NaN, 'elements': [], 'viewBox': []},
    openSidebar: false,
    selectedSpace: {'attributes': {}, 'globalId': '', 'subSystems': [], 'workOrders': []},
    openPanoramaViewer: false,
    photoSphere: {},
    loading: false,
    levels: []
  }

  // General /////////////////////////////////////////////////////////

  componentDidMount() {
    console.log(this.props);

    axios.get(`/storey/`)
      .then((response) => {
        const newLevels = response.data.map((storey) => storey['_level']);
        this.setState({levels: newLevels})
      })
  }

  initSelectedSpace(attributes ={}, subSystems=[], workOrders=[]) {
    let globalId = '';
    if (Object.keys(attributes).length > 0) {
      globalId = attributes['ifc_global_id'];
    }
    return {'attributes': attributes, 'globalId': globalId}
  }

  resetViewer() {
    const selectedSpace = this.initSelectedSpace()
     this.setState({floor: {'level': NaN, 'elements': [], 'viewBox': []}, selectedSpace: selectedSpace, openSidebar: false});
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

  toggleSidebarHandler = (e) => {
    this.setState((prevState) => {
      return {openSidebar: !prevState.openSidebar}
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

  close3DViewerHandler = () => {
    this.setState({openModelViewer: false})
  }

  closePanoramaViewerHandler = () => {
    this.setState({openPanoramaViewer: false})
  }

  // Render //////////////////////////////////////////////////////////
  render() {

    const {floor, openSidebar, selectedSpace, photoSphere, openPanoramaViewer, loading, levels}  = {...this.state};

    let spinner = null;

    let svgLayers = {}
    if (!(isNaN(floor['level']))) {

      const floorLayer = {'Floorplan': {
        'elements': floor['elements'].slice(),
        'isTransparent': false,
        'exceptions': []}}

      svgLayers = floorLayer;

      if (loading) {
        spinner = <div className={styles.Spinner}><Spinner/></div>
      }
    }

    let spaceSidebarContent = null;

    if (selectedSpace.globalId !== '') {
      spaceSidebarContent = (
        <SpaceInfo
          space={selectedSpace}
          handleSpacePanoramaClick={this.viewSpacePanoramaHandler}/>
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
        <SvgViewPort
          viewBox={floor['viewBox']}
          svgLayers={svgLayers}
          handleClickOnSpace={this.selectSpaceHandler}
          selectedSpaceId={selectedSpace ? selectedSpace.globalId : ''}/>
        <FloorControl
          floorLevels={levels}
          activeLevel={floor['level']}
          handleClick={this.selectFloorHandler}/>
        <ToggleSidebarButton
          handleClick={this.toggleSidebarHandler}
          isOpenSidebar={openSidebar}/>
      </div>
    );
  }
}

export default SvgViewer;
