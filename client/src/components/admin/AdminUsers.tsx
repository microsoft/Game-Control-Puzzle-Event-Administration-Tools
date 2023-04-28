import { useEffect, useState } from 'react';
import { Col, Form, ListGroup, ListGroupItem, Row, Alert, Card, Container } from 'react-bootstrap';
import { FaPencilAlt, FaPlus, FaUserAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import { Participant } from 'modules/admin/models';
import { addAdminUser, addUserToEventInstance, getAdminUsers, updateUserInfo } from "modules/admin/users/service";

import { AddParticipantForm, EditParticipantForm, EditParticipationForm } from './dialogs';
import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import { getEventInstanceId } from 'modules';
import { getAllParticipants } from 'modules/admin';
import { getStaffTeams, useStaffTeams } from 'modules/staff';

type UserProps = Readonly<{
    user: Participant
}>;

const AddUserToEventDialog = ({ user }: UserProps) => {
    const teams = useSelector(getStaffTeams);
    const currentUserEventInstanceId = useSelector(getEventInstanceId);
    const participation = user.participation.find(x => x.eventInstanceId === currentUserEventInstanceId);

    if (participation) {
        if (participation.isStaff) {
            return (
                <Row style={{textAlign: 'center'}}>
                    <Col xs={4} md={4} style={{textAlign: 'right'}}>Participation Info:</Col>
                    <Col xs={8} md={8} style={{textAlign: 'left'}}>Is Staff?: <em>{participation.isStaff ? 'yes' : 'no'}</em> Is Admin: <em>{participation.isAdmin ? 'yes' : 'no'}</em></Col>
                </Row>
            );
        } else {
            const team = teams.data.find(x => x.teamId === participation.teamId);

            return (
                <Row style={{textAlign: 'center'}}>
                    <Col xs={4} md={4} style={{textAlign: 'right'}}>Team:</Col>
                    <Col xs={8} md={8} style={{textAlign: 'left'}}><em>{team ? team.name : "UNKNOWN"}</em></Col>
                </Row>
            );
        }        
    } else {
        return null;
    }
};

const UserRow = ({ user }: UserProps) => {
    const currentUserEventInstanceId = useSelector(getEventInstanceId);
    const teams = useSelector(getStaffTeams);
    const dispatch = useDispatch();
    const participationForCurrentEvent = user.participation.find(x => x.eventInstanceId === currentUserEventInstanceId);

    return (
        <ListGroupItem key={user.participantId}>                        
            <Container fluid>
                <Row>
                    <Col>                    
                        <h5>{user.displayName}</h5>
                    </Col>
                    <Col sm="auto">
                    <DialogRenderProp
                        variant="outline-primary"
                        renderTitle={() => `Update information for ${user.displayName}`}
                        renderButton={() => <><FaPencilAlt/> Edit</>}
                        renderBody={(onComplete: any) =>
                            <EditParticipantForm
                                user={user}
                                onSubmit={participant => dispatch(updateUserInfo(user.participantId, participant))}
                                onComplete={onComplete}
                            />
                        }
                    />
                    <DialogRenderProp
                        variant="outline-primary"
                        renderTitle={() => `${participationForCurrentEvent ? "Update" : "Add"} participation for ${user.displayName}`}
                        renderButton={() => <>{participationForCurrentEvent ? <FaUserAlt/> : <FaPlus/>} Role</>}
                        renderBody={(onComplete: any) => 
                            <EditParticipationForm
                                participation={participationForCurrentEvent}
                                teams={teams.data}
                                onSubmit={update => dispatch(addUserToEventInstance(currentUserEventInstanceId, user.participantId, update))}
                                onComplete={onComplete}
                            />
                        }
                    />
                    </Col>
                </Row>
                { 
                    !!user.email && 
                    <Row style={{textAlign: 'center'}}>
                        <Col xs={4} md={4} style={{textAlign: 'right'}}>Email:</Col>
                        <Col xs={8} md={8} style={{textAlign: 'left'}}>{user.email}</Col>
                    </Row>   
                }
                {
                    !!user.contactNumber &&
                    <Row style={{textAlign: 'center'}}>
                        <Col xs={4} md={4} style={{textAlign: 'right'}}>Number:</Col>
                        <Col xs={8} md={8} style={{textAlign: 'left'}}>{user.contactNumber}</Col>
                    </Row>
                }
                <AddUserToEventDialog user={user}/>
            </Container>
        </ListGroupItem>
    );
};

const UserList = ({ filterText }: { filterText: string }) => {
    const [filterToCurrentEvent, setFilterToCurrentEvent] = useState(true);

    const currentUserEventInstanceId = useSelector(getEventInstanceId);
    const participants = useSelector(getAllParticipants);

    if (participants.data.length > 0) {
        let displayParticipants = filterToCurrentEvent ?
            participants.data.filter(x => x.participation.find(y => y.eventInstanceId === currentUserEventInstanceId) !== undefined) :
            participants.data;

        if (filterText !== '') {
            displayParticipants = displayParticipants.filter(x => x.displayName.includes(filterText))
        }

        return (
            <div>
                <Form.Check type="checkbox"
                    checked={filterToCurrentEvent}
                    onChange={(event: any) => setFilterToCurrentEvent(event.target.checked)}
                    label="Filter to current event"
                />
                <ListGroup>
                    { displayParticipants.map(user => <UserRow key={user.participantId} user={user}/>) }
                </ListGroup>
            </div>
        );
    } else {
        return <div>No participants available</div>;
    }
};

export const AdminUsers = () => {
    const [filterText, setFilterText] = useState('');

    const participants = useSelector(getAllParticipants);
    const { teams } = useStaffTeams();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAdminUsers());
    }, [dispatch]);

    return (
        <Card>
            <Card.Header>
                <h4>All Users</h4>
                <DialogRenderProp
                    variant="outline-primary"
                    renderTitle={() => "Add New User"}
                    renderButton={() => <div><FaPlus/> Add User</div>}
                    renderBody={(onComplete: any) => 
                        <AddParticipantForm
                            teams={teams.data}
                            onSubmit={(newUser: any) => dispatch(addAdminUser(newUser))}
                            onComplete={onComplete}
                        />
                    }
                />
            </Card.Header>
            <Card.Body>
                {
                    !!participants.lastError &&
                    <Alert variant="danger">Error updating users: {participants.lastError}</Alert>
                }
                {
                    !!participants.isLoading &&
                    <div>Loading...</div>
                }
                <Form.Control
                    type="text"
                    value={filterText}
                    onChange={(event: any) => setFilterText(event.target.value)}/>
                <UserList filterText={filterText}/>
            </Card.Body>
        </Card>
    );
};
