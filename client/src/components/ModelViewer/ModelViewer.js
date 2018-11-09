import React, { Component } from 'react';
import ForgeViewer from 'react-forge-viewer';
import styles from './ModelViewer.css';
import axios from '../../axios-api';

class ModelViewer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      view: null
    }
  }

  handleViewerError(error) {
    console.log('Error loading viewer.');
  }

  handleDocumentLoaded(doc, viewables) {
    if (viewables.length === 0) {
      console.error('Document contains no objects to be viewed.');
    }
    else {
      this.setState({view: viewables[0]});
    }
  }

  handleDocumentError(viewer, error) {
    console.log('Error loading a document');
  }

    handleModelLoaded(viewer, model){
    console.log('Loaded model:', model);
  }

  handleModelError(viewer, error){
    console.log('Error loading the model.');
  }

  getForgeToken() {
    return new Promise(function(resolve, reject) {
      axios.get('forge/token')
        .then((tokenResponse)=> {
          const token = {...tokenResponse.data, 'token_type': 'Bearer'};
          resolve(token);
        })
        .catch((err)=> {
          reject(err);
        })
    })
  }

  /* Once the viewer has initialized, it will ask us for a forge token so it can
  access the specified document. */
  async handleTokenRequested(onAccessToken){
    console.log('Token requested by the viewer.');
    if(onAccessToken){
      let token = await this.getForgeToken();
      if(token)
        onAccessToken(
          token.access_token, token.expires_in);
    }
  }

  render() {
    return (
      <div className={styles.Viewer}>
        <ForgeViewer
          version="5.0"
          urn={this.props.urn}
          view={this.state.view}
          onViewerError={this.handleViewerError.bind(this)}
          onTokenRequest={this.handleTokenRequested.bind(this)}
          onDocumentLoad={this.handleDocumentLoaded.bind(this)}
          onDocumentError={this.handleDocumentError.bind(this)}
          onModelLoad={this.handleModelLoaded.bind(this)}
          onModelError={this.handleModelError.bind(this)}
        />
      </div>
    );
  }

}
export default ModelViewer;
