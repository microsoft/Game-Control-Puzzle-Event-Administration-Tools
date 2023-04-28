import React, { useState } from 'react';
import { Form, FormGroup } from 'react-bootstrap';
import { Event, EventTemplate } from 'modules/admin/events';

type Props = Readonly<{
    event?: Event;
    onSubmit: (event: EventTemplate) => void;
}>;

export const EventForm = ({ event, onSubmit }: Props) => {
    const [eventId] = useState<string | undefined>(event?.eventId);
    const [eventName, setEventName] = useState(event?.name ?? "");

    return (
        <form onSubmit={(event: any) => {
                event.preventDefault();
                onSubmit({ eventId: eventId ?? undefined, eventName });
            }}>
            <FormGroup>
                <Form.Label>Event Name</Form.Label>
                <Form.Control type="text"
                              required
                              value={eventName}
                              placeholder="Event Name"
                              onChange={(event: any) => setEventName(event.target.value)}
                />
            </FormGroup>

            <input type="submit" value={event ? "Update Event" : "Add Event"}/>
        </form>
    );
};