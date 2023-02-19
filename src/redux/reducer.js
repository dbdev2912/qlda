const initState = {
    highlight: 0,
    navState: true,
    auth: {}
}

export default ( state = initState, action ) => {
    switch (action.type) {

        case "sessionInitialize":
            return sessionInitialize(state, action);
        break;

        case "setNavBarHighLight":
            return setNavBarHighLight(state, action)
            break;


        case "setNavState":
            return setNavState(state, action);
            break;

        default:
            return state;
    }
}

const sessionInitialize = ( state, action ) => {
    const { auth } = action.payload;
    return { ...state, auth }
}


const setNavBarHighLight = ( state, action ) => {
    const { url_id } = action.payload;
    return { ...state, highlight: url_id }
}

const setNavState = ( state, action ) => {
    const { navState } = action.payload;
    return { ...state, navState }
}
