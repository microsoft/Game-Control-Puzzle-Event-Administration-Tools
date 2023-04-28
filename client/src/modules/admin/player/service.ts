import Axios from 'axios';
import { fetchStaffTeams } from 'modules/staff/teams/service';

import { doServiceRequest } from 'modules/types/serviceCommon';
import { getEventInstanceId } from 'modules/user/selectors';
import * as actions from "./actions";

export const deletePlayerSubmission = (submissionId: string) => (dispatch: any, getState: any) => {
    const eventInstanceId = getEventInstanceId(getState());

    doServiceRequest(
        dispatch,
        () => Axios.delete(`api/admin/player/${eventInstanceId}/submissions/${submissionId}`),
        actions.ADMIN_PLAYER_SUBMISSION_DELETING,
        actions.ADMIN_PLAYER_SUBMISSION_DELETED,
        actions.ADMIN_PLAYER_SUBMISSION_FAILED,
        undefined,
        (payload: any) => {
            // Rather than return a delta, refetch teams when deleting a submission.
            dispatch(fetchStaffTeams());
            return payload;
        }
    );
};
