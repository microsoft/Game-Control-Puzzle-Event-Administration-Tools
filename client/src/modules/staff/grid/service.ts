import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";

export const getStaffGrid = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`api/staff/grid/${eventInstanceId}`),
        actions.STAFF_GRID_FETCHING,
        actions.STAFF_GRID_FETCHED,
        actions.STAFF_GRID_FAILED
    );
};