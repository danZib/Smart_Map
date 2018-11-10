import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import { mapReducer } from './mapReducer';

export const rootReducer = combineReducers({
	map: mapReducer,
	router: routerReducer
});