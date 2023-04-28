import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as moment from 'moment';

import { Module } from "modules/types";
import { GridViewModel } from './models';
import { getGridModule } from "./selectors";
import { getStaffGrid } from "./service";

export const shouldRefreshGrid = (gridModule: Module<GridViewModel>) =>
    (!gridModule || !gridModule.lastFetched || moment.utc().diff(gridModule.lastFetched, 'seconds') > 0) && !gridModule.isLoading; 

export const useStaffGrid = () => {
    const dispatch = useDispatch();
    const gridModule = useSelector(getGridModule);

    useEffect(() => {
        if (shouldRefreshGrid(gridModule)) {
            dispatch(getStaffGrid());
        }
    }, [dispatch, gridModule]);

    return {
        gridModule,
        getGrid: () => dispatch(getStaffGrid())
    };
};