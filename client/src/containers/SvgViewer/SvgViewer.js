import React, { Component } from 'react';
import SvgViewPort from '../../components/SvgViewPort/SvgViewPort';
import FloorControl from '../../components/FloorControl/FloorControl';
import SystemControl from '../../components/SystemControl/SystemControl';
import Sidebar from '../../components/Sidebar/Sidebar';
import SpaceInfo from '../../components/SpaceInfo/SpaceInfo';
import Modal from '../../components/UI/Modal/Modal';
import ModelViewer from '../../components/ModelViewer/ModelViewer';
import * as Utils from '../../utils';
import PanoramaViewer from '../../components/PanoramaViewer/PanoramaViewer';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import styles from './SvgViewer.css';
import axios from '../../axios-office-building';
import ToggleSidebarButton from '../../components/UI/Buttons/ToggleSidebarButton/ToggleSidebarButton';
class SvgViewer extends Component {


  state = {
    floor: {'level': NaN, 'elements': [], 'viewBox': []},
    openSidebar: false,
    selectedSpace: {'attributes': {}, 'globalId': '', 'subSystems': [], 'workOrders': []},
    systems: {},
    openModelViewer: false,
    openPanoramaViewer: false,
    activeUrn:'',
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

  initSystem() {
    return {'elements': [], 'isActive': false, 'subSystems': {}, openSidebar: false, openModelViewer: false, activeUrn:'', photoSphere: {}}
  }

  initSubSystem(isActive = false, elementIds = [], superSystemType = '', subSystemType = '') {
    return {'isActive': isActive, 'elementIds': elementIds, 'superSystemType': superSystemType,'subSystemType': subSystemType}
  }

  initSelectedSpace(attributes ={}, subSystems=[], workOrders=[]) {
    let globalId = '';
    if (Object.keys(attributes).length > 0) {
      globalId = attributes['ifc_global_id'];
    }
    return {'attributes': attributes, 'globalId': globalId, 'subSystems': subSystems, 'workOrders': workOrders}
  }

  resetViewer() {
    const selectedSpace = this.initSelectedSpace()
     this.setState({floor: {'level': NaN, 'elements': [], 'viewBox': []} , systems: {}, selectedSpace: selectedSpace, openSidebar: false});
  }

  updateSystem(systemType, system) {
    return new Promise((resolve, reject) => {
      this.setState({loading: true})
      let updatedSystem = {...system};
      if (updatedSystem['elements'].length > 0){
        this.setState({loading: false})
        return resolve(updatedSystem);
      }
      axios.get(`/storey/${this.state.floor['level']}/systems/${systemType}/svg`)
      .then((systemResponse) => {
        this.setState({loading: false})
        updatedSystem['elements'] = systemResponse.data
        resolve(updatedSystem)
      })
      .catch((err) => {
        this.setState({loading: false})
        reject(err)
      })
    })
  }

  getActiveSystems() {
    let activeSystems = Object.keys(this.state.systems)
      .filter((sysType) => this.state.systems[sysType]['isActive']);

    return activeSystems;
  }

  getSpacePanorama() {
    return new Promise( async (resolve, reject) => {
      const photoSphereRes = await axios.get(`/storey/${this.state.floor['level']}/space/${this.state.selectedSpace.globalId}/photospheres`)
        .catch((err) => { reject(err); });

      const newPhotoSphere = photoSphereRes.data;

      const hotSpotRes = await axios.get(`/storey/${this.state.floor['level']}/space/${this.state.selectedSpace.globalId}/photospheres/${newPhotoSphere.id}/hotspot`)
        .catch((err) => { reject(err); });

      newPhotoSphere['hotSpots'] = hotSpotRes.data

      resolve(newPhotoSphere)
    })
  }

  // Handlers ////////////////////////////////////////////////////////

  selectFloorHandler = (level, e) => {
    if (level === this.state.floor['level']){
      this.resetViewer()
      return;
    }

    Promise.all([
      axios.get(`/storey/${level}/svg`),
      axios.get(`/storey/${level}/systems`)
    ])
    .then(([floorplanRes, systemsRes]) => {
      const floorSystems = systemsRes.data.reduce((systems, sysRes) => {
        systems[sysRes.ifc_system_type] = this.initSystem()
        return systems
      }, {})
      const newElements = floorplanRes.data.elements
      const newViewBox = floorplanRes.data.viewBox
      const newFloor =  {'level': level, 'elements': newElements, 'viewBox': newViewBox};
      this.setState((prevState) => {
        const selectedSpace = this.initSelectedSpace()
        return { floor: newFloor , systems: floorSystems, selectedSpace: selectedSpace, openSidebar: false}
      });
    })
    .catch((err) => {
      console.log(err);
    })
  }

  selectSystemHandler = (systemType, e) => {
    let updatedSystems = {...this.state.systems}

    let currentActiveSystems = this.getActiveSystems();

    // Turn off system
    if (currentActiveSystems.includes(systemType)) {
      updatedSystems[systemType]['isActive'] = false;
      this.setState({systems: updatedSystems})
      return;
    }

    updatedSystems[systemType]['isActive'] = true

    // Turn on but elements already loaded
    this.updateSystem(systemType, updatedSystems[systemType])
      .then((upSystem) => {
        updatedSystems[systemType] = upSystem
        this.setState({systems: updatedSystems});
      });


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

    Promise.all([
      axios.get(`/storey/${this.state.floor['level']}/space/${spaceGuid}`),
      axios.get(`/storey/${this.state.floor['level']}/space/${spaceGuid}/workorder`)
    ])
    .then(([spaceRes, workOrderRes]) => {
      const subSystems = [];
      const selectedSpace = this.initSelectedSpace(spaceRes.data, subSystems, workOrderRes.data);
      this.setState({openSidebar: true, selectedSpace: selectedSpace});
    })
    .catch((err) => {
      console.log(err);
    })
  }


    // .then((response) => {
    //     const subSystems = [];
    //     const selectedSpace = this.initSelectedSpace(response.data, subSystems)
    //     this.setState({openSidebar: true, selectedSpace: selectedSpace});
    //   })


  viewSubSystemHandler = async ( systemType, subSystemType, serviceType, e) => {

    let updatedSystems = {...this.state.systems}
    let updatedSelectedSpace = {...this.state.selectedSpace}
    let currentActiveSystems = this.getActiveSystems();

    // Check if super system is already active
    if (!(currentActiveSystems.includes(systemType))) {

      updatedSystems[systemType]['isActive'] = true;


      updatedSystems[systemType] = await this.updateSystem(systemType, updatedSystems[systemType]);

    }

    let isSelected = false
    updatedSelectedSpace.subSystems.forEach((subSystem) => {
      if(subSystem.subSystemType === subSystemType && subSystem.isActive === true){
        isSelected = true;
        subSystem.isActive = false;
        this.setState({selectedSpace: updatedSelectedSpace, systems: updatedSystems});
      }
    })

    if (isSelected) {
      return;
    }
    axios.get(`/storey/${this.state.floor['level']}/space/${this.state.selectedSpace.globalId}/systems/${Utils.prepareAsUrlProp(systemType)}/subsystems/${Utils.prepareAsUrlProp(subSystemType)}/service/${serviceType}`)
      .then((response) => {
        const subSystem = this.initSubSystem(true, response.data, systemType, subSystemType)
        updatedSelectedSpace.subSystems.push(subSystem);

        this.setState({ selectedSpace: updatedSelectedSpace, systems: updatedSystems});
    })
    .catch((err) => {
      console.log(err);
    });

  }

  viewSpace3DHandler = (urn, e) => {
    this.setState({openModelViewer: !this.state.openModelViewer, activeUrn: urn})
  }

  viewSpacePanoramaHandler = async (e) => {

    const newPhotoSphere = await this.getSpacePanorama();

    this.setState({openPanoramaViewer: !this.state.openPanoramaViewer, photoSphere: newPhotoSphere})
  }

   // .then((response)=> {
   //      const updatedPhotoSphere = response.data;

   //      this.setState({openPanoramaViewer: !this.state.openPanoramaViewer, photoSphere: updatedPhotoSphere})
   //    })

  close3DViewerHandler = () => {
    this.setState({openModelViewer: false})
  }

  closePanoramaViewerHandler = () => {
    this.setState({openPanoramaViewer: false})
  }

  viewSpaceAddWorkOrderHandler = (e) => {

    const queryParams = [`globalId=${this.state.selectedSpace.globalId}`, `level=${this.state.floor.level}`];
    const queryString = queryParams.join('&');
    this.props.history.push({
      pathname: '/workorder',
      search: '?' + queryString
    });
  }

  viewSpaceViewWorkOrderHotSpotHandler = async (workorderId) => {
    let newPhotoSphere = await this.getSpacePanorama();
    const workOrderHotSpotRes = await axios.get(`/storey/${this.state.floor['level']}/space/${this.state.selectedSpace.globalId}/workorder/${workorderId}/hotspot`)
      .catch( err => { console.log(err); });

    const workOrderHotSpot = workOrderHotSpotRes.data;
    newPhotoSphere['pitch'] = workOrderHotSpot.pitch;
    newPhotoSphere['yaw'] = workOrderHotSpot.yaw;

    this.setState({openPanoramaViewer: !this.state.openPanoramaViewer, photoSphere: newPhotoSphere})
  }
  // Render //////////////////////////////////////////////////////////
  render() {

    const {floor, openSidebar, selectedSpace, systems, activeUrn, photoSphere, openModelViewer, openPanoramaViewer, loading, levels}  = {...this.state};

    let spinner = null;
    const systemTypesByLevel = Object.keys(systems)
    const activeSystems = Object.keys(systems).filter((sysType) => systems[sysType]['isActive'])

    const activeSubSystems = selectedSpace.subSystems
      .filter((subSystem) => subSystem.isActive === true)

    const activeSubSystemTypes = selectedSpace.subSystems
      .filter((subSystem) => subSystem.isActive === true)
      .reduce((acc, subSystem) => {
        if (acc[subSystem.superSystemType]) {
           acc[subSystem.superSystemType] = [...acc[subSystem.superSystemType], subSystem.subSystemType]
         } else {
            acc[subSystem.superSystemType] = [subSystem.subSystemType]
         }

        return acc;

      }, {})

    let svgLayers = {}
    if (!(isNaN(floor['level']))) {

      const floorLayer = {'Floorplan': {
        'elements': floor['elements'].slice(),
        'isTransparent': false,
        'exceptions': []}}

      svgLayers = activeSystems.reduce((layers, sysType) => {
        let isTransparent = false;

        let exceptions = activeSubSystems.reduce((acc, subSystem) => {
          let currendIds = []
          if (subSystem.superSystemType === sysType) {
            isTransparent = true;
            currendIds = subSystem.elementIds
          }
           return [...acc, ...currendIds]
        }, [])

        layers[sysType] = {'elements': systems[sysType]['elements'],
          'isTransparent': isTransparent,
          'exceptions': exceptions};
        return layers;
      }, floorLayer)

      if (loading) {
        spinner = <div className={styles.Spinner}><Spinner/></div>
      }
    }

    let spaceSidebarContent = null;

    if (selectedSpace.globalId !== '') {
      spaceSidebarContent = (
        <SpaceInfo
          space={selectedSpace}
          handleSubSystemClick={this.viewSubSystemHandler}
          handleSpace3DClick={this.viewSpace3DHandler}
          activeSubSystemTypes={activeSubSystemTypes}
          handleSpacePanoramaClick={this.viewSpacePanoramaHandler}
          handleAddWorkOrderClick={this.viewSpaceAddWorkOrderHandler}
          handleViewWorkOrderHotSpotClick={this.viewSpaceViewWorkOrderHotSpotHandler}/>
      );
    }



    return (
      <div className={styles.SvgViewer}>
        {spinner}
        <Modal show={openModelViewer} handleModelCloseClick={this.close3DViewerHandler} width={'80%'} height={'80%'}>
          {activeUrn === '' ? null : <ModelViewer urn={activeUrn} />}
        </Modal>
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
        <SystemControl
          systemTypes = {systemTypesByLevel}
          handleClick = {this.selectSystemHandler}
          activeSystems = {activeSystems}
          openSidebar = {openSidebar}/>
        <ToggleSidebarButton
          handleClick={this.toggleSidebarHandler}
          isOpenSidebar={openSidebar}/>
      </div>
    );
  }
}

/*


*/

export default withErrorHandler(SvgViewer, axios);
