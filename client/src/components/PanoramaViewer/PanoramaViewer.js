import React, { Component } from 'react';
import styles from './PanoramaViewer.css';
import StandardButton from '../UI/Buttons/StandardButton/StandardButton';
import Aux from '../../hoc/Aux/Aux';
class PanoramaViewer extends Component {

  constructor(props) {
    super(props);
    this.viewer = null;
    this.hotSpot = null;
  }

  static defaultProps = {
    width: '100%',
    height: '100%',
    autoLoad: true,
    autoRotate: false,
    yaw: 0,
    pitch: 0,
    guid: '',
    imageName: '',
    isSelecting: false,
    handleConfirm: ()=>{},
    hotSpots: []
  }

  componentDidMount() {
    const {globalId, imageName, yaw, pitch, autoLoad, autoRotate, hotSpots} = {...this.props};

    let image = require(`../../assets/images/panoramas/default.jpg`)

    try {
      image = require(`../../assets/images/panoramas/${globalId}/${imageName}`)
    }
    catch(error) {
    }

    if (window && window.pannellum) {
      if (this.props.isSelecting) {
        this.viewer = window.pannellum.viewer("pannellum-viewer", {
          type: "equirectangular",
          panorama: image,
          autoLoad: autoLoad,
          autoRotate: autoRotate,
          yaw: yaw,
          pitch: pitch,
          title: 'Select place to attach work order and confirm.'
        });

        this.viewer.on('load', this.sceneLoadedHandler)
        this.viewer.on('mouseup', this.sceneMouseUpHandler);
        this.viewer.on('mousedown', this.sceneMouseDownHandler);
      } else {
        this.viewer = window.pannellum.viewer("pannellum-viewer", {
          type: "equirectangular",
          panorama: image,
          autoLoad: autoLoad,
          autoRotate: autoRotate,
          yaw: yaw,
          pitch: pitch,
          hotSpots: hotSpots
        });
      }

    }
  }

  sceneMouseDownHandler = (e) => {
    this.click = true;
    setTimeout(() => { this.click = false; }, 200)
  }

  sceneLoadedHandler = (e) => {
  }

  sceneMouseUpHandler = (e) => {
    if (this.click) {
      const [tmpPitch, tmpYaw]  = this.viewer.mouseEventToCoords(e);

      this.viewer.removeHotSpot('tmpHotSpot');

      this.hotSpot = {
        "pitch": tmpPitch,
        "yaw": tmpYaw,
        "type": "info",
        "id": "tmpHotSpot"
      }
      this.viewer.addHotSpot(this.hotSpot);
    }
  }
  render() {

      const { width, height, isSelecting, handleConfirm} = {...this.props}
      let confirmButton = null

      if (isSelecting) {
        confirmButton = (
          <StandardButton
            clicked={()=> handleConfirm(this.hotSpot)}
            btnType='Success'>CONFIRM</StandardButton>
        );
      }

      return(
        <Aux>
          <div className={styles.Button}>
            {confirmButton}
          </div>
          <div className={styles.Viewer}>
            <div id="pannellum-viewer" style={{ width: width, height: height}}></div>
          </div>
        </Aux>

    );
  }
}



export default PanoramaViewer;
