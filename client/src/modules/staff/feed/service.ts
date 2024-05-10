import { getEventInstanceId } from "modules";
import { doServiceRequest } from "modules/types/serviceCommon";
import Axios from "axios";

import * as actions from "./actions";

export const getStaffFeed = () => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.get(`/api/staff/teams/${eventInstanceId}/feed`),
        actions.STAFF_FEED_FETCHING,
        actions.STAFF_FEED_FETCHED,
        actions.STAFF_FEED_FAILED
    );
};