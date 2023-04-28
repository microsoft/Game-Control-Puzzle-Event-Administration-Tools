import { useEffect } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { getMessagesModule } from 'modules/staff/messages';
import { getGcMessages, sendGcMessage } from 'modules/staff/messages/service';
import { useStaffTeams } from 'modules/staff/teams';
import { SendGcMessageForm } from './dialogs/SendGcMessageForm';

export const StaffSendMessage = () => {
    const { teams } = useStaffTeams();
    const messages = useSelector(getMessagesModule);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getGcMessages());
    }, [dispatch]);

    return <div>
        <SendGcMessageForm
            teams={teams.data}
            disabled={teams.isLoading}
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
