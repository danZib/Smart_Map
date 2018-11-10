import React, { Component } from 'react';
/* React-router */
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import styles from './App.css';
import SvgViewer from './containers/SvgViewer/SvgViewer';
import Header from './components/Layout/Header/Header';

class App extends Component {
  svgLoadedHandler = (src) => {
    console.log(this);
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        <main className={styles.Content}>
          <SvgViewer/>
        </main>
      </div>
    );
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));
