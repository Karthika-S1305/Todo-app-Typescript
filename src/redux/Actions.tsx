export const SET_AUTHENTICATED = 'SET_aUTHENTICATED';
export const LOGOUT = 'LOGOUT';

export const setAuthenticated = () => {
    return {
        type: SET_AUTHENTICATED,
    }
}

export const logout = () =>{
    return {
        type: LOGOUT,
    }
}