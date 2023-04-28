import React from 'react';
import { Button, Col, Container, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaLock, FaLockOpen, FaFastForward } from 'react-icons/fa';
import * as moment from 'moment';
import { SolveStatus } from 'modules/staff/clues';

type StatusProps = Readonly<{
    status: SolveStatus;
    onRelock: (teamId: string) => void;
    onSkip: (teamId: string) => void;
    onUnlock: (teamId: string) => void;
}>;

const SkippedTeam = ({ status, onRelock }: StatusProps) => {
    return (
        <ListGroupItem key={status.teamId}> 
            <Container fluid>
                <Row>
                    <Col>
                        <h4 className="status-team-name">{status.teamName}</h4>
                    </Col>
                    <Col sm="auto">
                        <div><Button onClick={() => onRelock(status.teamId)}><FaLock className="mr-2"/> Lock</Button></div>
                    </Col>
                </Row>
                <Row className="time-footer">
                    <small>Skipped at {moment.utc(status.startTime!).local().format('HH:mm:ss')}</small>
                </Row>
            </Container>
        </ListGroupItem>
    );
};

const PendingTeam = ({ status, onRelock }: StatusProps) => {
    return (
        <ListGroupItem key={status.teamId}> 
            <Container fluid>
                <Row>
                    <Col>
                        <h4 className="status-team-name">{status.teamName}</h4>
                    </Col>
                    <Col sm="auto">
                        <Button onClick={() => onRelock(status.teamId)}>
                            <FaLock className="mr-2"/> Lock
                        </Button>
                    </Col>
                </Row>
                <Row className="time-footer">
                    <small>Unlocked at {moment.utc(status.startTime!).local().format('HH:mm:ss')}</small>
                </Row>
            </Container>
        </ListGroupItem>
    );
};

const LockedTeam = ({ status, onUnlock, onSkip }: StatusProps) => {
    return (
        <ListGroupItem key={status.teamId}>
            <Container fluid>
                <Row>
                    <Col>
                        <h4 className="status-team-name">{status.teamName}</h4>
                    </Col>
                    <Col sm="auto">
                        <div>
                            <Button className="mr-2" onClick={() => onUnlock(status.teamId)}>
                                <FaLockOpen className="mr-2"/> Unlock
                            </Button>
                            <Button variant="warning" onClick={() => onSkip(status.teamId)}><FaFastForward className="mr-2"/>Skip</Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </ListGroupItem>
    );
};

const CompletedTeam = ({ status }: StatusProps) => {
    return (
        <ListGroupItem key={status.teamId}>
            <Container fluid>
                <Row>
                    <h4 className="status-team-name">{status.teamName}</h4>
                </Row>
                <Row className="time-footer">
                    <div><small>Solved at {moment.utc(status.solveTime!).local().format('HH:mm:ss')}</small></div>
                </Row>
            </Container>
        </ListGroupItem>
    );
};

type Props = Readonly<{
    teamsStatus: SolveStatus[];
    onRelock: (teamId: string) => void;
    onSkip: (teamId: string) => void;
    onUnlock: (teamId: string) => void;
}>;

export const TeamStatusList = ({ teamsStatus, ...rest }: Props) => {

    if (teamsStatus.length > 0) {
        // TODO: These could be defined somewhere where we only perform the filter when props change 
        // to avoid recalculating on every render.
        const inProgressTeams = teamsStatus.filter(status => status.solveTime === null && status.startTime !== null && status.isSkipped === false);
        const lockedTeams     = teamsStatus.filter(status => status.solveTime === null && status.startTime === null && status.isSkipped === false);
        const skippedTeams    = teamsStatus.filter(status => status.isSkipped === true);
        const completedTeams  = teamsStatus.filter(status => status.solveTime !== null);

        return (
            <div>
                {
                    inProgressTeams.length > 0 &&
                    <>
                        <strong>Teams In Progress</strong>
                        <ListGroup>
                            {inProgressTeams.map(status => <PendingTeam key={status.teamId} status={status}  {...rest} />)}
                        </ListGroup>
                    </>
                }
                {
                    lockedTeams.length > 0 &&
                    <>
                        <strong>Teams Locked</strong>
                        <ListGroup>                
                            {lockedTeams.map(status => <LockedTeam key={status.teamId} status={status} {...rest} />)}
                        </ListGroup>
                    </>
                }
                {
                    skippedTeams.length > 0 &&
                    <>
                        <strong>Teams Skipped</strong>            
                        <ListGroup>
                            {skippedTeams.map(status => <SkippedTeam key={status.teamId} status={status} {...rest} />)}
                        </ListGroup>
                    </>
                }
                {
                    completedTeams.length > 0 &&
                    <>
                        <strong>Teams Completed</strong>
                        <ListGroup>
                            {completedTeams.map(status => <CompletedTeam key={status.teamId} status={status} {...rest} />)}
                        </ListGroup>
                    </>
                }
            </div>
        );
    } else {
        return <div>No solve data available</div>
    }
};
