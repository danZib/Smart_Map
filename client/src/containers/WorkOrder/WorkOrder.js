import React, { Component } from 'react';
import StandardButton from '../../components/UI/Buttons/StandardButton/StandardButton';
import Modal from '../../components/UI/Modal/Modal';
import PanoramaViewer from '../../components/PanoramaViewer/PanoramaViewer';
import WorkOrderForm from './WorkOrderForm/WorkOrderForm';

import styles from './WorkOrder.css';
import axios from '../../axios-office-building.js';
import uuidv1 from 'uuid/v1';

class WorkOrder extends Component {

  state = {
    workOrder: {
      title: '',
      description: '',
      id: uuidv1(),
      hasHotSpot: false
    },
    spaceGlobalId: '',
    level: '',
    openPanoramaViewer: false,
    photoSphere: {},
    hotSpot: null,
    loading: false,
  }

  componentDidMount() {
    const query = new URLSearchParams(this.props.location.search);
    const params = {}
    for (let param of query.entries()) {
      params[param[0]] = param[1];
    }
    const {globalId} = {...params};
    const {level} = {...params};
    this.setState({spaceGlobalId: globalId, level: level})
  }

  onChangeHandler = (e) => {
    const newWorkorder = {...this.state.workOrder, [e.target.name]: e.target.value}

    this.setState({workOrder: newWorkorder})
  }

  workOrderCancelledHandler = () => {
    this.props.history.goBack();
  }

  workOrderContinuedHandler = async () => {
    // Some more stuff
    await axios.post(`/storey/${this.state.level}/space/${this.state.spaceGlobalId}/workorder`, {...this.state.workOrder})
      .catch((err) => { console.log(err); });

      if (this.state.hotSpot !== null) {
        await axios.post(`/storey/${this.state.level}/space/${this.state.spaceGlobalId}/photospheres/${this.state.photoSphere.id}/hotspot`, {workOrderId: this.state.workOrder.id, hotSpot:{...this.state.hotSpot}})
          .catch((err) => { console.log(err); });
      }

    this.props.history.goBack();
  }

  viewSpacePanoramaHandler = (e) => {

    axios.get(`/storey/${this.state.level}/space/${this.state.spaceGlobalId}/photospheres`)
      .then((response)=> {
        const updatedPhotoSphere = response.data;
        this.setState({openPanoramaViewer: !this.state.openPanoramaViewer, photoSphere: updatedPhotoSphere})
      })
      .catch((err)=> {
        console.log(err);
      })

  }

  closePanoramaViewerHandler = (e) => {
    this.setState({openPanoramaViewer: false});
  }

  confirmHotSpotHandler = (hotSpot) => {


    const newHotSpot = {
      pitch: hotSpot.pitch,
      yaw: hotSpot.yaw,
      type: hotSpot.type,
      id: uuidv1(),
      text: this.state.workOrder.title

    }
    console.log(newHotSpot);
    const updatedWorkOrder = {...this.state.workOrder}
    updatedWorkOrder.hasHotSpot = true;
    this.setState({openPanoramaViewer: false, hotSpot:newHotSpot})
  }

  render() {
    const {spaceGlobalId, photoSphere, openPanoramaViewer} = {...this.state};

    let panoramaViewer = null;

    if (this.state.openPanoramaViewer) {
      panoramaViewer = (
         <PanoramaViewer
          globalId={spaceGlobalId}
          {...photoSphere}
          isSelecting={true}
          handleConfirm={this.confirmHotSpotHandler}/>
      );
    }
    return(
      <div className={styles.WorkOrder}>
        <Modal show={openPanoramaViewer} handleModelCloseClick={this.closePanoramaViewerHandler} width={'80%'} height={'80%'}>
          {panoramaViewer}
        </Modal>
        <h2>Create Work Order</h2>
        <WorkOrderForm
          onChange={this.onChangeHandler}
          {...this.state.workOrder}/>
        <div className={styles.ButtonGroup}>
        <StandardButton
          className={styles.Hotspot}
          clicked={this.viewSpacePanoramaHandler}>
            Add Hotspot
        </StandardButton>
        <div>
          <StandardButton
            btnType='Success'
            clicked={this.workOrderContinuedHandler}>
              Continue
          </StandardButton>
          <StandardButton
            btnType='Danger'
            clicked={this.workOrderCancelledHandler}>
              Cancel
          </StandardButton>
        </div>


        </div>

      </div>

    );
  }
}


export default WorkOrder;
