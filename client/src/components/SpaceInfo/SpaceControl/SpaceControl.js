import React from 'react';
import PanelButton from '../../UI/Buttons/PanelButton/PanelButton';
import styles from './SpaceControl.css';

const spaceControl = (props) => {

  const panoramaClickHandler = (e) => props.handlePanoramaClick(e)
  const routeClickHandler = (e) => props.handleRouteClick(e)

  return (
    <div className = {styles.SpaceControl}>

      <PanelButton
        iconName={"fa/tasks"}
        text={"Safe Route"}
        click={routeClickHandler}/>
      <PanelButton
        isDisabled={true}
        iconName={"fa/database"}
        text={"More Data"}/>
      <PanelButton
        iconName={"fa/street-view"}
        text={"View Panorama"}
        click={panoramaClickHandler}/>
      <PanelButton
        isDisabled={true}
        iconName={"fa/cube"}
        text={"View Model"}/>
    </div>
  );
}

export default spaceControl;
