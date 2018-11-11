import React, { Component } from 'react';
import SpaceTitle from './SpaceTitle/SpaceTitle';
import SpaceImage from './SpaceImage/SpaceImage';
import SpaceControl from './SpaceControl/SpaceControl';
import SpaceAttributes from './SpaceAttributes/SpaceAttributes';

import styles from './SpaceInfo.css';
class SpaceInfo extends Component {

  render() {
    const {space, handleSpacePanoramaClick, handleSpaceRouteClick} = {...this.props};
    const spaceAttributes = space ? Object.keys(space)
       .filter((propKey) => {
        if (propKey.startsWith('_')) {
          return false;
        } else {
          return true;
        }
       })
       .reduce((attr, key) => {
        attr[key] = space[key];
        return attr;
       }, {}) : {}

    return (
      <div className={styles.Container}>
        <SpaceImage
          imageFileName={space['_image_file_name'] ? space['_image_file_name'] : ''}/>
        <SpaceTitle spaceName={space['ifc_name']}/>
        <SpaceControl
          handlePanoramaClick={handleSpacePanoramaClick}
          handleRouteClick={handleSpaceRouteClick}/>
        <SpaceAttributes space={spaceAttributes}/>
      </div>
    );
  }
}

export default SpaceInfo;
