import axios from 'axios';

export function getBuilding(dispatch){
	return function(buildingId = '27TOPmxCrDgPimmYFfwtvE'){
		axios.get('api/building/'+buildingId)
			.then((response) => {
				dispatch({ type: 'GET_BUILDING', building:response.data });
				//const newLevels = response.data.map((storey) => storey['_level']);
				//this.setState({levels: newLevels})
			}).catch((error) =>{
				console.log("Error: " + error);
			});
	}
}

export function setDimension(dispatch){
	return function(dimension){
		dispatch( {type: 'SET_DIMENSION', dimension:dimension });
	}
}