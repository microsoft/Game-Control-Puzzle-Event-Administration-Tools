import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getEventInstanceId } from 'modules';
import { getEventApiKeys } from 'modules/admin';
import { getApiKeysForEvent, updateApiKey } from "modules/admin/events/service";
import { Button } from 'react-bootstrap';

export const ApiKeys = () => {
    const eventApiKeys = useSelector(getEventApiKeys);
    const currentEventInstance = useSelector(getEventInstanceId);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getApiKeysForEvent(currentEventInstance));
    }, [dispatch, currentEventInstance]);

    const updateKeyCallback = (name: string) => {
        dispatch(updateApiKey(currentEventInstance, {
            name,
            eventInstanceId: currentEventInstance
        }));
    };            

    return (
        <div>
            <h4>Below are the known API keys for this event.</h4>

            <div>
                <Button onClick={() => updateKeyCallback("Test")}>Add Key</Button>
            </div>

            { eventApiKeys.isLoading && <div>Loading...</div> }
            { eventApiKeys.data.length === 0 && <div>There are no API keys for this event</div> }
            {
                eventApiKeys.data.length > 0 &&
                <div>
                    {eventApiKeys.data.map(key => <div key={key.id}>{key.name}: {key.keyValue}</div>)}
                </div>
            }
        </div>
    );
};