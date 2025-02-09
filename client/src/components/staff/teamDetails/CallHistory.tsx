import moment from 'moment';
import { useState } from 'react';
import { Button, Col, Collapse, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import _ from 'lodash';

import { CallTemplate } from 'modules/types';
import { StaffTeam } from 'modules/staff';

const getFriendlyNameForCallType = (call: CallTemplate) => {
    const ctype = call.callType ?? '';
    switch (ctype.toLowerCase().trim()) {
        case 'checkin':
            return 'Routine Check-In';
        case 'teamfree':
            return 'Puzzle Request Button';
        case 'teamhelp':
            return 'Help Request Button';
        case 'hint':
            return 'Hint';
        case 'confirm':
            return 'Confirm Data';
        case 'other':
            return 'Other';
        default:
        case 'none':
            return 'Unknown or unspecified type';
    }
};

const CallList = ({ currentTeam }: { currentTeam: StaffTeam }) => {
    if (currentTeam && currentTeam.callHistory) {
        const callHistory = currentTeam.callHistory;

        return (
            <ListGroup>
                {callHistory
                    .sort(function c(a, b) {
                        return moment.utc(b.callStart).diff(moment.utc(a.callStart));
                    })
                    .map((call) => {
                        const participant = _.find(currentTeam.roster, (player) => player.participantId === call.participant);
                        return (
                            <ListGroupItem key={call.callId}>
                                <div>
                                    <Row>
                                        <Col xs={8} md={8} style={{ textAlign: 'left' }}>
                                            <div>Call with {participant ? participant.displayName : 'Unknown participant'}</div>
                                            <div>{getFriendlyNameForCallType(call)}</div>
                                            {call.notes && (
                                                <div>
                                                    <small>GC Internal Notes: {call.notes}</small>
                                                </div>
                                            )}
                                            {call.teamNotes && (
                                                <div>
                                                    <small>Team said to GC: {call.teamNotes}</small>
                                                </div>
                                            )}
                                            {call.publicNotes && (
                                                <div>
                                                    <small>GC said to team: {call.publicNotes}</small>
                                                </div>
                                            )}
                                        </Col>
                                        <Col xs={4} md={4} style={{ textAlign: 'right' }}>
                                            <div>
                                                <small>Call Started</small>
                                            </div>
                                            <div>
                                                <small>{moment.utc(call.callStart).fromNow()}</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                                Is Active? {call.callEnd === null ? 'yes' : 'no'}
                            </ListGroupItem>
                        );
                    })}
            </ListGroup>
        );
    } else {
        return <div>There have been no calls for this team yet.</div>;
    }
};

export const CallHistory = ({ currentTeam }: { currentTeam: StaffTeam }) => {
    const [showCallHistory, setShowCallHistory] = useState(false);

    return (
        <div>
            <h4>
                Call History &nbsp;
                <Button onClick={() => setShowCallHistory(!showCallHistory)}>{showCallHistory ? 'Hide' : 'Show'}</Button>
            </h4>
            <Collapse in={showCallHistory}>
                <div>
                    <CallList currentTeam={currentTeam} />
                </div>
            </Collapse>
        </div>
    );
};
