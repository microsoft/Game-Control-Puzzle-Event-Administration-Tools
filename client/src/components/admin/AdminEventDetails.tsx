import React, { useEffect } from 'react';
import { Alert, Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FaPencilAlt, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import { EventForm, EventInstanceForm } from './dialogs';
import { getParticipantId, getUser } from 'modules';
import { Event, getEventsModule } from 'modules/admin';
import { addAdminEvent, addEventInstance, cloneEventInstance, getAdminEvents } from 'modules/admin/events/service';
import { addUserToEventInstance } from "modules/admin/users/service";

const EventInstancesList = ({ event }: { event: Event }) => {
    const participantId = useSelector(getParticipantId);
    const user = useSelector(getUser);
    const dispatch = useDispatch();

    if (event.eventInstances !== null) {
        return <ListGroup className="clickable">
                {event.eventInstances.map(eventInstance => 
                    <ListGroupItem key={eventInstance.eventInstanceId}>
                        {eventInstance.friendlyName} ( {eventInstance.eventType} )
                        { user.data.participation.find((x: any) => x.eventInstanceId === eventInstance.eventInstanceId) ?
                            '' : 
                            <Button onClick={() => {                              
                                dispatch(addUserToEventInstance(
                                    eventInstance.eventInstanceId,
                                    participantId,
                                    {
                                        isStaff: true,
                                        isAdmin: true
                                    }
                                ));
                            }}>
                                Join
                            </Button>
                        }
                    </ListGroupItem>)}
            </ListGroup>
    } else {
        return null;
    }
};

export const AdminEventDetails = ({ match: { params: { id }} }: RouteComponentProps<{ id: string }>) => {
    const eventsModule = useSelector(getEventsModule);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAdminEvents());
    }, [dispatch]);

    const foundEvent = eventsModule.data.find(event => event.eventId === id);

    return (
        <>
            { 
                !!eventsModule.lastError &&
                <Alert variant="danger">{eventsModule.lastError}</Alert>
            }

            {
                !!eventsModule.isLoading && 
                <Alert variant="info">Loading...</Alert>
            }

            {
                foundEvent && (
                <div>
                    <h4>
                        {foundEvent.name}
                        <DialogRenderProp
                            variant="outline-primary"
                            renderTitle={() => `Update ${foundEvent.name}`}
                            renderButton={() => <><FaPencilAlt /> Edit</>}
                            renderBody={(onComplete: any) =>
                                <EventForm
                                    event={foundEvent}
                                    onSubmit={updatedEvent => {
                                        dispatch(addAdminEvent(updatedEvent));
                                        onComplete();
                                    }}
                                />
                            }
                        />
                        <DialogRenderProp
                            variant="outline-primary"
                            renderTitle={() => "Add New Event Instance"}
                            renderButton={() => <><FaPlus /> Add Instance</>}
                            renderBody={(onComplete: any) =>
                                <EventInstanceForm
                                    eventInstances={foundEvent.eventInstances}
                                    onSubmit={newInstance => {
                                        if (newInstance.sourceEvent) {
                                            dispatch(cloneEventInstance(id, newInstance.sourceEvent, newInstance));
                                        } else {
                                            dispatch(addEventInstance(id, newInstance));
                                        }

                                        onComplete();
                                    }}                                
                                />
                            }
                        />
                    </h4>
                    <div>
                        <EventInstancesList event={foundEvent} />
                    </div>
                </div>
            )}
            {
                !foundEvent && (
                    <div>Failed to load event details.</div>
                )
            }
        </>
    );
};