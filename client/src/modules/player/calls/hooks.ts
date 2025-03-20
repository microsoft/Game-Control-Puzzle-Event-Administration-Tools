import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';

import { Module, CallTemplate } from 'modules/types';
import { PlayerCall } from './models';
import { fetchPlayerCalls, updatePlayerCall } from './service';

const playerCallsSelector = (state: any): Module<PlayerCall[]> => state.player.calls;

export const shouldRefreshCalls = (callsModule: Module<PlayerCall[]>) =>
    !callsModule.isLoading && (!callsModule.lastFetched || moment.utc().diff(callsModule.lastFetched, 'seconds') > 60);

export const usePlayerCalls = () => {
    const dispatch = useDispatch();
    const callsModule = useSelector(playerCallsSelector);

    useEffect(() => {
        if (shouldRefreshCalls(callsModule)) {
            dispatch(fetchPlayerCalls());
        }
    }, [dispatch, callsModule]);

    return {
        playerCalls: callsModule,
        updateCall: (callTemplate: CallTemplate) => dispatch(updatePlayerCall(callTemplate)),
    };
};
