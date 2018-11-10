export function mapReducer(state = {isLoading: false, dimension:2}, action) {
	switch(action.type){
	case 'IS_LOADING':
		return{
			...state, 
				isLoading: true
		}
	case 'DONE_LOADING':
		return{
			...state, 
			isLoading: false
		}

	case 'GET_BUILDING':
		return{
			...state,
			building: action.building
		}

	case 'SET_DIMENSION':
		return{
			...state,
			dimension: action.dimension
		}

	default:
		return state;
	}
}