import { Alert, ListGroup, ListGroupItem } from 'react-bootstrap';

import { useStaffMessagesQuery, useSendGcMessageMutation } from 'modules/staff/messages/queries';
import { useStaffTeamsQuery } from 'modules/staff/teams/queries';
import { getErrorMessage } from 'lib/apiFetch';
import { SendGcMessageForm } from './dialogs/SendGcMessageForm';

export const StaffSendMessage = () => {
    const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useStaffTeamsQuery();
    const { data: messages = [], error: messagesError } = useStaffMessagesQuery();
    const sendMessage = useSendGcMessageMutation();

    const error = teamsError || messagesError;

    return <div>
        {!!error && <Alert variant="danger">{getErrorMessage(error)}</Alert>}
        <SendGcMessageForm
            teams={teams}
            disabled={teamsLoading}
            onSubmit={messageTemplate => sendMessage.mutate(messageTemplate)} />
        <div>
            <strong>Message History</strong>
            <ListGroup>
                {messages.map(message =>
                    <ListGroupItem key={message.messageId}>
                        {message.messageText}
                    </ListGroupItem>)}
            </ListGroup>
        </div>
    </div>;
};
