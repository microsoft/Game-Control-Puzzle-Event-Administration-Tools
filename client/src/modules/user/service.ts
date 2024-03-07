import Axios from "axios";

import * as actions from './actions';

const doLoginRequest = async (dispatch: any, request: Promise<any>, errorContext: string) => {
    dispatch({ type: actions.USER_LOGIN_STARTED });
    try {
        const response = await request;
        localStorage.setItem('userToken', JSON.stringify(response.data));
        dispatch({ type: actions.USER_LOGIN_FINISHED, payload: response.data });
    } catch (e: any) {
        if (e?.response?.status === 401) {
            dispatch(
                {
                    type: actions.USER_LOGIN_FAILED,
                    payload: "Invalid user name or password.",
                    additionalInformation: errorContext
                }
            );
        } else {
            dispatch(
                {
                    type: actions.USER_LOGIN_FAILED,
                    payload: e?.message ?? `Unknown error: ${e?.response?.status}`
                }
            );
        }
    }
}

export const loginUserName = (userName: string, password: string) => (dispatch: any) => {
    doLoginRequest(
        dispatch,
        Axios.post('/api/Authentication/jwt', { 'UserName': userName, 'Password': password }),
        `(Local username: ${userName})`
    );
};

export const loginMsaToken = (msaToken: { token: string, preferred_username?: string, oid?: string }) => (dispatch: any) => {
    doLoginRequest(
        dispatch,
        Axios.put('/api/Authentication/jwtMsa', { token: msaToken.token }),
        `(Microsoft Account: ${msaToken?.preferred_username ?? "Invalid Token"} [${msaToken?.oid ?? "Invalid ID"}]`
    );
}

export const loadUserTokenFromCache = () => (dispatch: any) => {
    if (localStorage.getItem('userToken')) {
        dispatch({
            type: actions.USER_LOGIN_FINISHED,
            payload: JSON.parse(localStorage.getItem('userToken') ?? "")
        });
    }

    /*
    TODO: I really don't like this being coupled to anything outside user, should a messages
          module be listening for an event here?
    if (localStorage.getItem('userMessages')) {
        dispatch({
            type: messageActions.PLAYER_MESSAGES_FETCHED,
            payload: JSON.parse(localStorage.getItem('userMessages') ?? "")
        })
    }
    */
};

export const logout = () => (dispatch: any) => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userMessages');
    dispatch({ type: actions.USER_LOGGED_OUT });
};