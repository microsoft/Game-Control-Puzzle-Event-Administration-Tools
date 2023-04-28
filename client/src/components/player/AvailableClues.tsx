import { Card, ListGroup, ListGroupItem } from 'react-bootstrap'; 
import { LinkContainer } from 'react-router-bootstrap';
import * as moment from 'moment';

import { usePlayerClues } from 'modules/player';
import { CallManager } from './CallManager';

export const AvailableClues = () => {
    document.title = "Puzzles";
    const { cluesModule } = usePlayerClues();

    const unsolvedPuzzles = cluesModule.data.filter(clue => clue.submissionTime === null && clue.submittableType.trim() !== 'Plot').sort((a,b) => a.sortOrder - b.sortOrder);
    const solvedPuzzles = cluesModule.data.filter(clue => clue.submissionTime !== null && clue.submittableType.trim() !== 'Plot').sort((a,b) => a.sortOrder - b.sortOrder);

    const renderSolvedClues = () => {
        if (solvedPuzzles?.length > 0) {
            return <div>
                    <h4>Solved Clues</h4>
                    <ListGroup className="clickable">
                        {solvedPuzzles.map(clue => 
                            <LinkContainer
                                to={`/player/clue/${clue.tableOfContentId}`}
                                key={clue.tableOfContentId}>
                                <ListGroupItem
                                    key={clue.tableOfContentId}>
                                    <div>{clue.submittableTitle}</div>
                                    <div><small>Solved: {moment.utc(clue.submissionTime).fromNow()}</small></div>                                    
                            </ListGroupItem>
                        </LinkContainer>
                    )}
                    </ListGroup>
                </div>;
        }
    }

    const renderAvailableClues = () => {
        if (unsolvedPuzzles?.length > 0) {
               return (
                <Card>
                    <Card.Header>Available Clues</Card.Header>
                    <Card.Body>
                        <ListGroup className="clickable">
                            {unsolvedPuzzles.map(clue => 
                            <LinkContainer
                                to={`/player/clue/${clue.tableOfContentId}`}
                                key={clue.tableOfContentId}>
                                <ListGroupItem
                                    key={clue.tableOfContentId}>
                                    <div>{clue.submittableTitle}</div>
                                    <div><small>Unlocked: {moment.utc(clue.unlockTime).fromNow()}</small></div>                                    
                                </ListGroupItem>
                            </LinkContainer>
                        )}
                        </ListGroup>
                    </Card.Body>
                </Card>
            );
        } else {
            return <div><h4>No clues available</h4></div>;
        }
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
