import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';

import { getEventsModule } from '..';
import { Module } from 'modules/types';
import { Event, EventTemplate } from './models';
import { addAdminEvent, getAdminEvents } from './service';

export const shouldRefreshEvents = (eventsModule: Module<Event[]>) =>
    !eventsModule.isLoading && (!eventsModule.lastFetched || moment.utc().diff(eventsModule.lastFetched, 'seconds') > 600);

export const useAdminEvents = () => {
    const dispatch = useDispatch();
    const eventsModule = useSelector(getEventsModule);

    useEffect(() => {
        if (shouldRefreshEvents(eventsModule)) {
            dispatch(getAdminEvents());
        }
    }, [dispatch, eventsModule]);

    return {
        eventsModule,
        addEvent: (eventTemplate: EventTemplate) => dispatch(addAdminEvent(eventTemplate)),
    };
};
