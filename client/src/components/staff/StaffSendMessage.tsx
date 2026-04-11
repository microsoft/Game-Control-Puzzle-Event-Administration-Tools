import { useEffect } from 'react';
import { Alert, ListGroup, ListGroupItem } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { getMessagesModule } from 'modules/staff/messages';
import { getGcMessages, sendGcMessage } from 'modules/staff/messages/service';
import { useStaffTeamsQuery } from 'modules/staff/teams/queries';
import { getErrorMessage } from 'lib/apiFetch';
import { SendGcMessageForm } from './dialogs/SendGcMessageForm';

export const StaffSendMessage = () => {
    const { data: teams = [], isLoading, error } = useStaffTeamsQuery();
    const messages = useSelector(getMessagesModule);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getGcMessages());
    }, [dispatch]);

    return <div>
        {!!error && <Alert variant="danger">{getErrorMessage(error)}</Alert>}
        <SendGcMessageForm
            teams={teams}
            disabled={isLoading}
            onSubmit={messageTemplate => dispatch(sendGcMessage(messageTemplate))} />
        <div>
            <strong>Message History</strong>
            <ListGroup>
                {messages.data.map(message =>
                    <ListGroupItem key={message.messageId}>
                        {message.messageText}
                    </ListGroupItem>)}
            </ListGroup>
        </div>
    </div>;
};
