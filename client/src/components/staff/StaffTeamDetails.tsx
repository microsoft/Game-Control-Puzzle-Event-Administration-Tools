import { useState } from 'react';
import { Breadcrumb, Button, Tab, Tabs, Card, Alert, ListGroup, ListGroupItem, Container, Row } from 'react-bootstrap';
import { FaGem, FaPencilAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { useHistory, useParams } from 'react-router-dom';

import { getIsUserAdmin, getPointsNameSetting } from 'modules';

import { TeamCallForm } from './dialogs';
import { GrantPointsForm } from './dialogs/GrantPointsForm';
import { CallHistory, TeamAchievements, TeamChallenges, TeamRoster, TeamState } from './teamDetails';

import DialogRenderProp from './dialogs/DialogRenderProp';
import { TeamForm } from './dialogs';
import { getStaffTeam, useStaffTeams } from 'modules/staff';
import { useStaffClues } from 'modules/staff/clues/hooks';
import { getLastDeleteError, getIsDeletingSubmission } from 'modules/admin';
import { updateUserInfo } from 'modules/admin/users/service';
import { deletePlayerSubmission } from 'modules/admin/player/service';
import { CallTemplate } from 'modules/types';

export const StaffTeamDetails = () => {
    const { id, tab } = useParams<{ id: string; tab: string }>();

    const { cluesModule } = useStaffClues();
    const { teams, addOrUpdateTeam, deleteTeam, updatePoints, updateCallForTeam } = useStaffTeams();
    const currentTeam = useSelector((state) => getStaffTeam(state, id));
    const [key, setKey] = useState(tab);
    const isAdmin = useSelector(getIsUserAdmin);
    const pointsSettingName = useSelector(getPointsNameSetting);

    const isDeletingSubmission = useSelector(getIsDeletingSubmission);
    const lastDeleteError = useSelector(getLastDeleteError);

    const dispatch = useDispatch();
    const history = useHistory();

    const clues = cluesModule;

    const handleCallUpdate = (updatedCall: CallTemplate) => updateCallForTeam(id, updatedCall);

    const updateCurrentTab = (k: string) => {
        setKey(k);
        history.replace('/staff/teams/' + id + '/' + k);
    };
    const startCall = () => handleCallUpdate({ callType: 'None' });

    if (currentTeam) {
        let activeCall = currentTeam.callHistory ? currentTeam.callHistory.find((x) => x.callEnd === null) : undefined;

        return (
            <div>
                <Breadcrumb>
                    <LinkContainer to="/staff/teams">
                        <Breadcrumb.Item>Teams</Breadcrumb.Item>
                    </LinkContainer>
                    <Breadcrumb.Item active>{currentTeam.name}</Breadcrumb.Item>
                </Breadcrumb>

                <div>
                    Details for {currentTeam.name} ({currentTeam.shortName})
                </div>
                <div>Passphrase: {currentTeam.passphrase}</div>
                <div>
                    Current {pointsSettingName}: {currentTeam.points}
                </div>
                <div style={{ padding: '15px ' }}>
                    <DialogRenderProp
                        variant="outline-primary"
                        size="lg"
                        renderTitle={() => `Update ${currentTeam.name}`}
                        renderButton={() => (
                            <>
                                <FaPencilAlt /> Edit
                            </>
                        )}
                        renderBody={(onComplete) => <TeamForm team={currentTeam} onSubmit={addOrUpdateTeam} onComplete={onComplete} />}
                    />
                    <DialogRenderProp
                        variant="outline-primary"
                        size="lg"
                        renderTitle={() => `Grant ${pointsSettingName}`}
                        renderButton={() => (
                            <>
                                <FaGem /> Grant {pointsSettingName}
                            </>
                        )}
                        renderBody={(onComplete) => (
                            <GrantPointsForm
                                onSubmit={(points, reason) => {
                                    updatePoints(currentTeam.teamId, { pointValue: points, reason });
                                    onComplete();
                                }}
                            />
                        )}
                    />
                </div>
                {currentTeam.gcNotes && <Alert variant="info">NOTE: {currentTeam.gcNotes}</Alert>}

                <Tabs defaultActiveKey={1} id="team-detals-tabs" activeKey={key} onSelect={(eventKey) => updateCurrentTab(eventKey ?? '')}>
                    <Tab eventKey={1} title="Calls">
                        {activeCall ? (
                            <Card>
                                <TeamCallForm key={activeCall.callId} puzzles={clues.data} currentCall={activeCall} onUpdate={handleCallUpdate} />
                            </Card>
                        ) : (
                            <Button onClick={startCall}>Start Call</Button>
                        )}

                        <CallHistory currentTeam={currentTeam} />
                    </Tab>
                    <Tab eventKey={2} title="Roster">
                        <TeamRoster roster={currentTeam.roster} updateUserInfo={(participantId, updates) => dispatch(updateUserInfo(participantId, updates))} />
                    </Tab>
                    <Tab eventKey={3} title="Achievements">
                        <TeamAchievements teamId={id} />
                    </Tab>
                    <Tab eventKey={4} title="Challenges">
                        <TeamChallenges teamId={id} />
                    </Tab>
                    <Tab eventKey={5} title="State">
                        <TeamState teamId={id} />
                    </Tab>
                    {!!isAdmin && (
                        <Tab eventKey={6} title="Submissions">
                            <ListGroup>
                                {!!lastDeleteError && <Alert variant="danger">{lastDeleteError}</Alert>}
                                {currentTeam.submissionHistory.map((submission) => (
                                    <ListGroupItem key={submission.submissionId}>
                                        <Container>
                                            <Row>{submission.submission}</Row>
                                            <Row>
                                                <Button disabled={isDeletingSubmission} onClick={() => dispatch(deletePlayerSubmission(submission.submissionId))} variant="danger">
                                                    Delete
                                                </Button>
                                            </Row>
                                        </Container>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </Tab>
                    )}
                    {!!isAdmin && (
                        <Tab eventKey={7} title="Admin">
                            <Button onClick={() => deleteTeam(id)}>Delete</Button>
                        </Tab>
                    )}
                </Tabs>
            </div>
        );
    } else {
        // TODO: We should be able to kick off a fetch for this specific
        // team rather than just showing an error message.
        return <div>ERROR: Team details unavailable</div>;
    }
};
