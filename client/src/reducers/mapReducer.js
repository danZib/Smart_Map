export function mapReducer(state = {isLoading: false, dimension:2, floor:0, multiple:false, space:null}, action) {
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

	case 'SET_MULTIPLE':
		return{
			...state,
			multiple: action.multiple
		}

	case 'SET_FLOOR':
		return{
			...state, 
			floor:action.floor
		}

	case 'SET_SPACE':
		return{
			...state, 
			space:action.space
		}

	default:
		return state;
	}
}