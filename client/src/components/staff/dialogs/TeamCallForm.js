import React, { useState } from 'react';
import {   Form,FormGroup, Button } from 'react-bootstrap';
import * as moment from 'moment';

export const TeamCallForm = ({ currentCall, onUpdate, puzzles }) => {
    const [callId] = useState(currentCall ? currentCall.callId : undefined);
    const [toCEntry, setToCEntry] = useState(currentCall ? currentCall.toCEntry : undefined);
    const [callType, setCallType] = useState((currentCall && currentCall.callType) ? currentCall.callType.trim() : '');
    const [callSubType, setCallSubType] = useState((currentCall && currentCall.callSubType)  ? currentCall.callSubType.trim() : '');
    const [notes, setNotes] = useState(currentCall ? currentCall.notes : '');
    const [teamNotes] = useState(currentCall ? currentCall.teamNotes : '');
    const [publicNotes, setPublicNotes] = useState(currentCall ? currentCall.publicNotes : '');

    return (
        <div>
            <h4>Update Active Call</h4>
                <FormGroup>
                    <Form.Label>Call For Clue</Form.Label>
                    <Form.Control as="select"
                                onChange={event => setToCEntry(event.target.value)}
                                value={toCEntry}>
                            <option value={undefined}>None</option>
                            {
                                puzzles !== undefined ? 
                                    puzzles.map(puzzle => <option value={puzzle.tableOfContentId}>{puzzle.submittableTitle}</option>) :
                                    ''
                            }
                    </Form.Control>
                </FormGroup>

                <FormGroup>
                    <Form.Label>Call Type</Form.Label>
                    <Form.Control as="select"
                                onChange={event => setCallType(event.target.value)}
                                value={callType}>
                        <option value="None">None</option>
                        <option value="Hint">Hint</option>
                        <option value="Confirm">Confirm</option>
                        <option value="Other">Other</option>
                        <option value="TeamFree  ">Puzzle Request</option>
                        <option value="TeamHelp  ">Help Request</option>
                        <option value="Checkin">Routine Check In w/ Team</option>
                    </Form.Control>
                </FormGroup>

                <FormGroup>
                    <Form.Label>Call Sub Type</Form.Label>
                    <Form.Control as="select"
                                onChange={event => setCallSubType(event.target.value)}
                                value={callSubType}>
                        <option value="None">None</option>
                        <option value="HintSmall">Small Hint</option>
                        <option value="HintBig">Big Hint</option>
                        <option value="HintFree">Free Hint</option>
                        <option value="HintSpecial">Special Hint</option>
                    </Form.Control>
                </FormGroup>      

                <FormGroup>
                    <Form.Label>GC Call Notes</Form.Label>
                    <Form.Control type="text"
                                onChange={event => setNotes(event.target.value)}
                                value={notes}/>
                </FormGroup>

                <FormGroup>
                    <Form.Label>Notes For Team</Form.Label>
                    <Form.Control type="text"
                                onChange={event => setPublicNotes(event.target.value)}
                                value={publicNotes}/>
                </FormGroup>

                <FormGroup>
                    <Form.Label>Notes from Team</Form.Label>
                    <Form.Control type="text"
                                 disabled
                                 value={teamNotes}/>
                </FormGroup>
                <FormGroup>
                    <em>Last updated {moment.utc(currentCall.lastUpdated).fromNow()}</em>
                </FormGroup>
                <Button onClick={() => onUpdate({ callId, tableOfContentsEntry: toCEntry, callType, callSubType, notes, publicNotes})}>Update and Keep Call Open</Button>
                <Button onClick={() => onUpdate({ callId, tableOfContentsEntry: toCEntry, callType, callSubType, notes, publicNotes, callEnd: moment.utc().format()})}>Update and End Call</Button>
        </div>
    );
}