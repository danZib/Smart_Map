import React, { Component } from 'react';
import SpaceTitle from './SpaceTitle/SpaceTitle';
import SpaceImage from './SpaceImage/SpaceImage';
import SpaceControl from './SpaceControl/SpaceControl';
import SpaceAttributes from './SpaceAttributes/SpaceAttributes';
import SpaceVentilation from './SpaceVentilation/SpaceVentilation';
import SpaceWorkOrders from './SpaceWorkOrders/SpaceWorkOrders';

import styles from './SpaceInfo.css';
class SpaceInfo extends Component {

  render() {
    const {space, activeSubSystemTypes, handleSubSystemClick, handleSpace3DClick, handleSpacePanoramaClick, handleAddWorkOrderClick, handleViewWorkOrderHotSpotClick} = {...this.props};
    const spaceAttributes = Object.keys(space.attributes)
       .filter((propKey) => {
        if (propKey.startsWith('_')) {
          return false;
        } else {
          return true;
        }
       })
       .reduce((attr, key) => {
        attr[key] = space.attributes[key];
        return attr;
       }, {})

    const space_urn = space.attributes['_urn'] ? space.attributes['_urn'] : '';

    let workOrdersCard = null;
    if (space.workOrders.length !== 0) {
      workOrdersCard = (
        <SpaceWorkOrders
          workOrders={space.workOrders}
          handleShowClick={handleViewWorkOrderHotSpotClick}/>
      );
    }
    return (
      <div className={styles.Container}>
        <SpaceImage
          imageFileName={space.attributes['_image_file_name'] ? space.attributes['_image_file_name'] : ''}/>
        <SpaceTitle spaceName={space.attributes['ifc_name']}/>
        <SpaceControl
          handlePanoramaClick={handleSpacePanoramaClick}
          handle3DClick={handleSpace3DClick}
          handleSpaceAddWorkOrderClick={handleAddWorkOrderClick}
          urn={space_urn}/>
        <SpaceAttributes space={spaceAttributes}/>
        <SpaceVentilation handleShowClick={handleSubSystemClick} subSystems={'Ventilation' in activeSubSystemTypes ? activeSubSystemTypes['Ventilation'] : []}/>
        {workOrdersCard}
      </div>
    );
  }
}

export default SpaceInfo;
