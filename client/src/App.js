import React, { Component } from 'react';
import styles from './App.css';
import SvgViewer from './containers/SvgViewer/SvgViewer';
import WorkOrder from './containers/WorkOrder/WorkOrder';
import Header from './components/Layout/Header/Header';

import { Route, Switch } from 'react-router-dom';

class App extends Component {

  svgLoadedHandler = (src) => {
    console.log(this);
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        <main className={styles.Content}>
          <Switch>
            <Route path="/" exact component={SvgViewer}/>
            <Route path="/workorder" component={WorkOrder}/>
          </Switch>
        </main>
      </div>
    );
  }
}
export default App;

