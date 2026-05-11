import { withCallbacks, LogLevel, HttpTransportType } from './redux-signalr/index';
import signalMiddleware from './redux-signalr/index';
import { APPLICATION_URL } from '../../constants';
import { fetchPlayerAchievements } from 'modules/player/achievements/service';
import { fetchPlayerCalls } from 'modules/player/calls/service';
import { fetchPlayerChallenges } from 'modules/player/challenges/service';
import { fetchPlayerClues } from 'modules/player/clues/service';
import { fetchPlayerMessages } from 'modules/player/messages/service';
import { fetchStaffClues, fetchStaffClueDetails } from 'modules/staff/clues/service';
import { getStaffGrid } from 'modules/staff/grid/service';
import { queryClient } from 'lib/queryClient';
import { queryKeys } from 'lib/queryKeys';
import { getEventInstanceId } from 'modules/user/selectors';

export const createSignalMiddleware = (history: any) => {
    const isOnPage = (url: string) => {
        return history.location.pathName === url || window.location.href.indexOf(url) > 0;
    };

    const callbacks = withCallbacks()
        .add('admin_challenge', (teamId: string) => (dispatch: any, getState: () => any) => {
            const eventInstanceId = getEventInstanceId(getState());
            queryClient.invalidateQueries({ queryKey: queryKeys.staff.challenges(eventInstanceId) });
        })
        .add('admin_submission', (teamId: string) => (dispatch: any, getState: any) => {
            if (isOnPage('/staff/grid') || isOnPage('/staff/actioncenter') || isOnPage('/staff/clues') || isOnPage('/staff/teams')) {
                dispatch(getStaffGrid());
                const eventInstanceId = getEventInstanceId(getState());
                queryClient.invalidateQueries({ queryKey: queryKeys.staff.teams(eventInstanceId) });
            }
        })
        .add('admin_pulse', (teamId: string) => (dispatch: any, getState: any) => {})
        .add('admin_call', (teamId: string) => (dispatch: any, getState: any) => {
            if (isOnPage('/staff/grid') || isOnPage('/staff/actioncenter') || isOnPage('/staff/clues') || isOnPage('/staff/teams')) {
                dispatch(getStaffGrid());
                const eventInstanceId = getEventInstanceId(getState());
                queryClient.invalidateQueries({ queryKey: queryKeys.staff.teams(eventInstanceId) });
            }
        })
        .add('admin_instance', (clueId: string) => (dispatch: any, getState: any) => {
            if (isOnPage('/staff/clues/' + clueId)) {
                dispatch(fetchStaffClues());
                dispatch(fetchStaffClueDetails(clueId));
            }
        })
        // Add a feature that allows us to force-reload everyone's page remotely if we want them
        // to pick up a new client build that we've deployed.
        .add('admin_forcerefresh', () => (dispatch: any, getState: any) => {
            window.location.reload();
        })
        .add('call', (teamId: string) => (dispatch: any, getState: any) => {
            dispatch(fetchPlayerCalls());
        })
        .add('achievement', (teamId: string) => (dispatch: any, getState: any) => {
            dispatch(fetchPlayerAchievements());
        })
        .add('message', (teamId: string) => (dispatch: any, getState: any) => {
            dispatch(fetchPlayerMessages());
        })
        .add('challenge', (challengeId: string) => (dispatch: any, getState: any) => {
            dispatch(fetchPlayerChallenges());
        })
        .add('toc', (teamId: string) => (dispatch: any, getState: any) => {
            dispatch(fetchPlayerClues());
        })
        // Add a feature that allows us to force-reload everyone's page remotely if we want them
        // to pick up a new client build that we've deployed.
        .add('forcerefresh', () => (dispatch: any, getState: any) => {
            window.location.reload();
        });

    const signal = signalMiddleware({
        callbacks,
        url: APPLICATION_URL + 'hub',
        logLevel: LogLevel.Debug,
        connectionOptions: {
            accessTokenFactory: () => {
                let token = JSON.parse(localStorage.getItem('userToken') ?? '{}');
                return token.token;
            },
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets,
        },
    });

    return signal;
};

export default createSignalMiddleware;
