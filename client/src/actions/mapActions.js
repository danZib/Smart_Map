import axios from 'axios';

export function getBuilding(dispatch){
	return function(buildingId = '27TOPmxCrDgPimmYFfwtvE'){
		axios.get('api/building/'+buildingId+'/svg')
			.then((response) => {
				dispatch({ type: 'GET_BUILDING', building:response.data });
				//const newLevels = response.data.map((storey) => storey['_level']);
				//this.setState({levels: newLevels})
			}).catch((error) =>{
				console.log("Error: " + error);
			});
	}
}

export function setMultiple(dispatch){
	return function(multiple){
		dispatch( {type: 'SET_MULTIPLE', multiple:multiple });
	}
}

export function setFloor(dispatch){
	return function(floor){
		dispatch( {type: 'SET_FLOOR', floor:floor });
	}
}

export function setDimension(dispatch){
	return function(dimension){
		dispatch( {type: 'SET_DIMENSION', dimension:dimension });
	}
}

export function setCurrentSpace(dispatch){
	return function(spaceGuid, buildingId = '27TOPmxCrDgPimmYFfwtvE'){
		if(spaceGuid != null){
		    axios.get(`api/building/${buildingId}/space/${spaceGuid}`)
		    .then((spaceRes) => {
		    	dispatch({type: 'SET_SPACE', space: spaceRes})
		    })
		    .catch((err) => {
		      console.log(err);
		    })
		}else{
			dispatch({type: 'SET_SPACE', space: null})
		}
	}
}