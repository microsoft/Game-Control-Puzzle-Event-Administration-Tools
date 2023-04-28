import { useDispatch, useSelector } from 'react-redux'; 
import * as moment from 'moment';

import { Module } from "modules/types";
import { TeamData } from "./models";
import { getTeamModule } from './selectors';
import { useEffect } from 'react';
import { fetchTeamData } from './service';


export const shouldRefreshTeam = (teamModule : Module<TeamData>) =>
    !teamModule.isLoading && (!teamModule.lastFetched || moment.utc().diff(teamModule.lastFetched, 'seconds') > 60);

export const useTeamData = () => {
    const teamModule = useSelector(getTeamModule);
    const dispatch = useDispatch();

    useEffect(() => {
        if (shouldRefreshTeam(teamModule)) {
            dispatch(fetchTeamData());
        }
    }, [teamModule, dispatch]);

    return {
        teamModule
    };
};