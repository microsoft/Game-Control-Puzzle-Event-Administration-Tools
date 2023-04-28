import { ListGroup, ListGroupItem, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux'
import * as moment from 'moment';

import { getPlayerInbox, PlayerMessage } from 'modules/player';
import { CallManager} from "./CallManager";

const GcMessage = ({ message }: { message: PlayerMessage }) => {
    return (
        <ListGroupItem key={message.messageId}>
            <div className="playerGcMessage">
                <div className="playerGcMessageTime">{moment.utc(message.lastUpdated).fromNow()}</div>
                <div className="playerGcMessageText"><span>{message.messageText}</span></div>
            </div>
        </ListGroupItem>
    );
};

const GcMessageList = () => {
    const messagesState = useSelector(getPlayerInbox);

    if (!messagesState.isLoading && messagesState.data.length === 0) {
        return <div>No messages available at this time.</div>;
    } else {
        return (
            <ListGroup>
                {messagesState.data.map((message: PlayerMessage) => <GcMessage key={message.messageId} message={message}/>)}
            </ListGroup>
        );
    }
};

export const PlayerInbox = () => {
    document.title = "Messages from GC";

    return (
        <div>
            <CallManager />
            <Card className="playerMessageHistoryCard">
                <Card.Header>
                    Message History
                </Card.Header>
                <Card.Body>
                    <GcMessageList/>
                </Card.Body>
            </Card>
        </div>
    );
}