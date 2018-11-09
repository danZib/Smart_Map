import React, { Component } from 'react';
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
export default App;

