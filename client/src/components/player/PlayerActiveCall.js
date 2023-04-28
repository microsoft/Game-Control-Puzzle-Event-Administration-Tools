import React, { useState, useEffect } from 'react';
import {  Form,FormGroup, Button } from 'react-bootstrap';
import * as moment from 'moment';

export const PlayerActiveCall = ({ currentCall, onUpdate }) => {
    const [call, setCall] = useState(currentCall);
    const [callId] = useState(currentCall.callId);
    const [teamNotes, setTeamNotes] = useState(currentCall.teamNotes);
    const [publicNotes, setPublicNotes] = useState(currentCall.publicNotes);

    useEffect(() => {
        if (call !== currentCall)
        {
            setCall(currentCall);
            if (publicNotes !== currentCall.publicNotes)
            {
                setPublicNotes(currentCall.publicNotes);
            }
            // If someone else on your team updated the notes, we'll clobber any unsaved edits you have.
            if (teamNotes && teamNotes !== currentCall.teamNotes)
            {
                setPublicNotes(currentCall.teamNotes);
            }
        }
    }, [call, currentCall, publicNotes, teamNotes]);
    
    let callType = JSON.stringify(currentCall);
    switch(currentCall.callType)
    {
        case "TeamFree": 
            callType = "Puzzle Requested";
            break;
        case "TeamHelp":
        default:
            callType = "Assistance Requested";
            break;
    }

    return (
        <div className="playerActiveCallEditor">
            {callType && <div className="playerActiveCallType">{callType}</div>}
                
            <FormGroup>
                <Form.Label>Notes from GC</Form.Label>
                <Form.Control type="text"
                as="textarea"
                             disabled
                             value={publicNotes ?? ""}/>
            </FormGroup>
            <FormGroup className="mt-4">
                <Form.Label>Notes for GC</Form.Label>
                <Form.Control type="text"
                as="textarea"
                className="playerActiveCallTextbox"
                             onChange={event => setTeamNotes(event.target.value)}
                             value={teamNotes ?? ""}/>
            </FormGroup>
            <FormGroup>
                <em>Last updated {moment.utc(currentCall.lastUpdated).fromNow()}</em>
            </FormGroup>

            <Button onClick={() => onUpdate({ callId, teamNotes, publicNotes })}>Save Changes</Button>
        </div>
    );
}