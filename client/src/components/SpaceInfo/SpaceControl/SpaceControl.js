import React from 'react';
import PanelButton from '../../UI/Buttons/PanelButton/PanelButton';
import styles from './SpaceControl.css';

const spaceControl = (props) => {

  const modelClickHandler = (e) => props.handle3DClick(props.urn, e)
  const panoramaClickHandler = (e) => props.handlePanoramaClick(e)
  const addWorkOrderClickHandler = (e) => props.handleSpaceAddWorkOrderClick(e)

  return (
    <div className = {styles.SpaceControl}>

      <PanelButton
        iconName={"fa/tasks"}
        text={"Add Workorder"}
        click={addWorkOrderClickHandler}/>
      <PanelButton
        isDisabled={true}
        iconName={"fa/database"}
        text={"Add Assets"}/>
      <PanelButton
        iconName={"fa/street-view"}
        text={"View Panorama"}
        click={panoramaClickHandler}/>
      <PanelButton
        iconName={"fa/cube"}
        text={"View Model"}
        click={modelClickHandler}/>
    </div>
  );
}

export default spaceControl;
