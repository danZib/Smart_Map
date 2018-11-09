import React, { Component } from 'react';
import SpaceTitle from './SpaceTitle/SpaceTitle';
import SpaceImage from './SpaceImage/SpaceImage';
import SpaceControl from './SpaceControl/SpaceControl';
import SpaceAttributes from './SpaceAttributes/SpaceAttributes';

import styles from './SpaceInfo.css';
class SpaceInfo extends Component {

  render() {
    const {space, handleSpacePanoramaClick, handleSpaceRouteClick} = {...this.props};
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

    return (
      <div className={styles.Container}>
        <SpaceImage
          imageFileName={space.attributes['_image_file_name'] ? space.attributes['_image_file_name'] : ''}/>
        <SpaceTitle spaceName={space.attributes['ifc_name']}/>
        <SpaceControl
          handlePanoramaClick={handleSpacePanoramaClick}
          handleRouteClick={handleSpaceRouteClick}/>
        <SpaceAttributes space={spaceAttributes}/>
      </div>
    );
  }
}

export default SpaceInfo;
