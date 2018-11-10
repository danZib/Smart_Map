import React from 'react';
import ReactDOM from 'react-dom'
/* Redux */
import { Provider } from 'react-redux';
import App from './App.js';
import { store, history } from './store';
import { ConnectedRouter } from 'react-router-redux';

import 'semantic-ui-css/semantic.min.css';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

/*
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

ReactDOM.render(app, document.getElementById('root'));
*/

ReactDOM.render((
	<Provider store={store}>
		<ConnectedRouter history={history}>
			<App/>
		</ConnectedRouter>
	</Provider>
),document.getElementById('root'));

registerServiceWorker();