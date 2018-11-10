import {createStore, applyMiddleware} from 'redux';
import logger from 'redux-logger';
import { rootReducer } from './reducers/index.js';
import {routerMiddleware} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';

export var history = createHistory();
const _routerMiddleware = routerMiddleware(history);

export var store = createStore(
	rootReducer,
	applyMiddleware(_routerMiddleware, logger)
);