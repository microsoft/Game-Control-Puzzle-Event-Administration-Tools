import Axios from "axios";

import * as constants from "../../constants";
import * as userActions from "modules/user/actions";

Axios.defaults.baseURL = constants.APPLICATION_URL;

/**
 * Helper function for making an asynchronous network call that performs boilerplate Redux actions.
 * @param dispatch Redux dispatch for dispatching the common async actions
 * @param serviceCall Function for performing the underlying Axois or other network calls.
 * @param loadingAction Action to dispatch before making the network request
 * @param successAction Action to dispatch when the network request succeeds. The data field of the repsonse will be passed as payload unless a mapper was specified
 * @param errorAction Action to dispatch when the network request fails. The error will be in the payload field, unless it is a HTTP 401 in which case a sign out action will be dispatched.
 * @param loadingPayload Additional content to include in the loading action payload
 * @param successMapper Mapper to pass additional context or modify the response payload before dispatching the action.
 * @param callback Optional callback to be called after the success dispatch action.
 */
export const doServiceRequest = async (dispatch: any, serviceCall: () => Promise<any>, loadingAction: string, successAction: string, errorAction: string, loadingPayload?: any, successMapper?: (payload: any) => any, callback?: () => void) => {
    dispatch({ type: loadingAction, payload: loadingPayload });

    try {
        const response = await serviceCall();
        dispatch({ type: successAction, payload: successMapper ? successMapper(response.data) : response.data });
        callback?.();
    } catch (e) {
        handleServiceError(e, dispatch, errorAction);
    }
}

const handleServiceError = (error: any, dispatch: any, action: string) => {
    if (error?.response?.status === 401) {
        localStorage.removeItem('userToken');
        dispatch({ type: userActions.USER_LOGGED_OUT });
    } else if (error?.response?.status === 403) {
        dispatch({ type: action, payload: "You do not have access to this resource"});
    } else {
        dispatch({ type: action, payload: error.message });
    }
}
