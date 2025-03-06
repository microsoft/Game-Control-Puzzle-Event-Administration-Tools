import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { getUser } from 'modules';

const UserAccount = () => {
    const user = useSelector(getUser);

    const renderParticipationHistory = (user: any) => {
        if (user !== null && user.participation !== null) {
            // TODO: Should probably triple check that we have a valid start and end time.
            return (
                <ListGroup>
                    {user.participation.map((participation: any) => (
                        <ListGroupItem key={participation.participationId}>
                            {moment(participation.eventStartTime).format('LL')} - {moment(participation.eventEndTime).format('LL')}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            );
        } else {
            return <div>User has not participated in any events</div>;
        }
    };

    return (
        <div>
            <div>User account details go here</div>
            {renderParticipationHistory(user.data)}
        </div>
    );
};

export default UserAccount;
