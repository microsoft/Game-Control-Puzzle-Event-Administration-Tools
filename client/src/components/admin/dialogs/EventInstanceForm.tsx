import { useState } from 'react';
import { Form, FormGroup } from 'react-bootstrap';
import Datetime from 'react-datetime';
import moment from 'moment';

import { EventInstance, EventInstanceTemplate } from 'modules/admin';

type Props = Readonly<{
    onSubmit: (eventInstance: EventInstanceTemplate) => void;
    eventInstances: EventInstance[];
}>;

export const EventInstanceForm = ({ eventInstances, onSubmit }: Props) => {
    const [friendlyName, setFriendlyName] = useState('');
    const [eventType, setEventType] = useState('Beta');
    const [startTime, setStartTime] = useState(moment.utc());
    const [endTime, setEndTime] = useState(moment.utc());
    const [sourceEvent, setSourceEvent] = useState('none');

    const handleSubmit = (event: any) => {
        event.preventDefault();
        onSubmit({
            friendlyName,
            eventType,
            startTime,
            endTime,
            sourceEvent: sourceEvent !== 'none' ? sourceEvent : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormGroup>
                <Form.Label>Friendly Name</Form.Label>
                <Form.Control type="text" value={friendlyName} placeholder="Friendly Name" onChange={(event) => setFriendlyName(event.target.value)} />
            </FormGroup>

            <FormGroup>
                <Form.Label>Event Type</Form.Label>
                <Form.Control as="select" value={eventType} onChange={(event) => setEventType(event.target.value)}>
                    <option value="Beta">Beta</option>
                    <option value="RC">Release Candidate</option>
                    <option value="RTM">RTM</option>
                </Form.Control>
            </FormGroup>
            <FormGroup>
                <Form.Label>Start Time</Form.Label>
                <Datetime value={moment.utc(startTime).local()} onChange={(value) => moment.isMoment(value) && setStartTime(moment.utc(value))} />
            </FormGroup>
            <FormGroup>
                <Form.Label>End Time</Form.Label>
                <Datetime value={moment.utc(endTime).local()} onChange={(value) => moment.isMoment(value) && setEndTime(moment.utc(value))} />
            </FormGroup>

            {!!eventInstances && (
                <FormGroup>
                    <Form.Label>Source Event Instance</Form.Label>
                    <Form.Control as="select" value={sourceEvent} onChange={(event) => setSourceEvent(event.target.value)}>
                        <option value={'none'}>None</option>
                        {eventInstances.map((eventInstance) => (
                            <option key={eventInstance.eventInstanceId} value={eventInstance.eventInstanceId}>
                                {eventInstance.friendlyName}
                            </option>
                        ))}
                    </Form.Control>
                </FormGroup>
            )}

            <input type="submit" value="Add Event Instance" />
        </form>
    );
};
