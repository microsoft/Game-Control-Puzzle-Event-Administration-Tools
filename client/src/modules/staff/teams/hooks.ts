import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';

import { CallTemplate } from 'modules/types';
import { PointsTemplate, StaffTeamState, TeamTemplate } from './models';
import { getStaffTeams } from './selectors';
import { addOrUpdateTeam, deleteTeam, fetchStaffTeams, updateCallForTeam, updatePoints } from './service';

export const shouldRefreshTeams = (staffTeamsModule: StaffTeamState) => {
    return !staffTeamsModule || !staffTeamsModule.lastFetched || moment.utc().diff(staffTeamsModule.lastFetched, 'seconds') > 15;
};

export const useStaffTeams = () => {
    const dispatch = useDispatch();
    const teams = useSelector(getStaffTeams);

    // Refresh the all-up teams list as necessary
    useEffect(() => {
        if (shouldRefreshTeams(teams)) {
            dispatch(fetchStaffTeams());
        }
    }, [dispatch, teams]);

    return {
        teams,
        addOrUpdateTeam: (teamTemplate: TeamTemplate) => dispatch(addOrUpdateTeam(teamTemplate)),
        deleteTeam: (teamId: string) => dispatch(deleteTeam(teamId)),
        updatePoints: (teamId: string, pointsTemplate: PointsTemplate) => dispatch(updatePoints(teamId, pointsTemplate)),
        updateCallForTeam: (teamId: string, callTemplate: CallTemplate, callback?: () => void) => dispatch(updateCallForTeam(teamId, callTemplate, callback)),
    };
};
