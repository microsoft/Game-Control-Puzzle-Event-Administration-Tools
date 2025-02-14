import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as moment from 'moment';

import { StaffClueTemplate } from './models';
import { getStaffClues } from './selectors';
import { createClue, fetchStaffClues } from './service';
import { StaffCluesState } from './staffCluesModule';

export const shouldRefreshClues = (cluesModule: any) => !cluesModule.isLoading && (!cluesModule.lastFetched || moment.utc().diff(cluesModule.lastFetched, 'seconds') > 60);

export const useStaffClues = () => {
    const cluesModule: StaffCluesState = useSelector(getStaffClues);
    const dispatch = useDispatch();

    useEffect(() => {
        if (shouldRefreshClues(cluesModule)) {
            dispatch(fetchStaffClues());
        }
    }, [dispatch, cluesModule]);

    return {
        cluesModule,
        addClue: (clueTemplate: StaffClueTemplate) => dispatch(createClue(clueTemplate)),
    };
};
