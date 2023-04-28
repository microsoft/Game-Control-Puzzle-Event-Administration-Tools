import React from 'react';
import { ListGroup, ListGroupItem, Alert } from 'react-bootstrap'
import { FaPlus } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap'

import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import { EventForm } from './dialogs/EventForm';
import { useAdminEvents } from 'modules/admin/events/hooks';

export const AdminEvents = () => {
    document.title = "Game Control - Event Management";
    const { eventsModule, addEvent } = useAdminEvents();

    return (
        <div>
            <h5>
                All Events
                &nbsp;
                <DialogRenderProp
                    variant="outline-primary"
                    renderTitle={() => "Add Event"}
                    renderButton={() => <FaPlus/>}
                    renderBody={(onComplete: any) => 
                        <EventForm
                            onSubmit={newEvent => {
                                addEvent(newEvent);
                                onComplete();
                            }}
                        />
                    }
                />
            </h5>
            { 
                !!eventsModule.lastError &&
                <Alert variant="danger">{eventsModule.lastError}</Alert>
            }

            {
                !!eventsModule.isLoading && 
                <Alert variant="info">Loading...</Alert>
            }
            {
                !!eventsModule.data &&
                <ListGroup className="clickable">
                    {eventsModule.data.map(event => 
                        <LinkContainer key={event.eventId} to={`/admin/events/${event.eventId}`}>
                            <ListGroupItem>
                                {event.name}
                            </ListGroupItem>
                        </LinkContainer>
                    )}
                </ListGroup>
            }
        </div>
    );
};
