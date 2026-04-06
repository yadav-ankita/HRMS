
const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                userData: action.payload,
            }
        case 'REGISTER_USER_SUCCESS':
            return {
                ...state,
                userData: action.payload,
            }
        case 'REGISTER_USER_ERROR':
            return {
                ...state,
                userData: null,
            }
        case 'LOGOUT_USER':
            return {
                ...state,
                userData: null,
            }
        default:
            return state;
    }


}
export default reducer;