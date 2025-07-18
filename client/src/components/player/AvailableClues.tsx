import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import moment from 'moment';
import 'moment-timezone';

import { usePlayerClues, usePlayerTakeOverClue } from 'modules/player';
import { CallManager } from './CallManager';
import { Redirect } from 'react-router-dom';

export const AvailableClues = () => {
    document.title = 'Puzzles';
    const { cluesModule } = usePlayerClues();
    const takeOverClue = usePlayerTakeOverClue();

    const unsolvedPuzzles = cluesModule.data.filter((clue) => clue.submissionTime === null && clue.submittableType.trim() !== 'Plot').sort((a, b) => a.sortOrder - b.sortOrder);
    const solvedPuzzles = cluesModule.data.filter((clue) => clue.submissionTime !== null && clue.submittableType.trim() !== 'Plot').sort((a, b) => a.sortOrder - b.sortOrder);

    const renderSolvedClues = () => {
        if (solvedPuzzles?.length > 0) {
            return (
                <div>
                    <h4>Solved Clues</h4>
                    <ListGroup className="clickable">
                        {solvedPuzzles.map((clue) => (
                            <LinkContainer to={`/player/clue/${clue.tableOfContentId}`} key={clue.tableOfContentId}>
                                <ListGroupItem key={clue.tableOfContentId}>
                                    <div>{clue.submittableTitle}</div>
                                    <div>
                                        <small>Solved: {moment.utc(clue.submissionTime).fromNow()}</small>
                                    </div>
                                </ListGroupItem>
                            </LinkContainer>
                        ))}
                    </ListGroup>
                </div>
            );
        }
    };

    const renderAvailableClues = () => {
        if (unsolvedPuzzles?.length > 0) {
            return (
                <Card>
                    <Card.Header>Available Clues</Card.Header>
                    <Card.Body>
                        <ListGroup className="clickable">
                            {unsolvedPuzzles.map((clue) => (
                                <LinkContainer to={`/player/clue/${clue.tableOfContentId}`} key={clue.tableOfContentId}>
                                    <ListGroupItem key={clue.tableOfContentId}>
                                        <div>{clue.submittableTitle}</div>
                                        <div>
                                            <small>Unlocked: {moment.utc(clue.unlockTime).fromNow()}</small>
                                        </div>
                                    </ListGroupItem>
                                </LinkContainer>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            );
        } else {
            return (
                <div>
                    <h4>No clues available</h4>
                </div>
            );
        }
    };

    if (takeOverClue) {
        return <Redirect to={`/player/clue/${takeOverClue.tableOfContentId}`} />
    }

    return (
        <div>
            <span>
                <div>
                    <CallManager />
                </div>
            </span>
            {renderAvailableClues()}
            {renderSolvedClues()}
        </div>
    );
};
