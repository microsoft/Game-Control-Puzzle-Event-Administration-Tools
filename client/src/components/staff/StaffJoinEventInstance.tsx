import { Alert, Button, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { selfServiceJoinEventInstance } from 'modules/admin/users/service';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const StaffJoinEventInstance = () => {
    const { id, name } = useParams<{ id: string; name: string }>();
    const query = useQuery();
    const dispatch = useDispatch();
    const history = useHistory();
    const user = useSelector((state: any) => state.user);

    const joinEvent = (eventInstanceId: string) => {
        if (eventInstanceId) {
            dispatch(
                selfServiceJoinEventInstance(eventInstanceId, user.data.participantId, query.get('inviteId')!, {
                    isStaff: true,
                    isAdmin: false,
                })
            );

            history.replace('/logout');
        }
    };

    if (user.eventId.toLowerCase() === id.toLowerCase()) {
        alert("You're already part of the " + name + ' event and your account is ready to go.  Thanks for helping us staff!');
        history.replace('/staff/clues');
    }

    return (
        <Card>
            <Card.Header>Join Event Instance - For Staff Only</Card.Header>
            <Card.Body>
                {!query.get('inviteId') && <Alert variant="danger">An invite code is required to self-join an event.</Alert>}
                <div>
                    You are currently in event: {user.eventName ?? 'No Event Name'} {user.eventId ?? 'No event ID'}
                </div>
                <div>
                    Would you like to join event {name} {id} as a staff member?
                </div>
                <div>
                    If you are a <i>player</i> in this event, you should not have received this link. Please do not click this button and contact Game Control for assistance.
                </div>
                <Button onClick={() => joinEvent(id)}>Join Event</Button>
            </Card.Body>
        </Card>
    );
};

export default StaffJoinEventInstance;
