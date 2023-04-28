import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ClueState } from 'modules/staff/clues';
import { ClueIcon } from './ClueIcon';

type Props = Readonly<{
    clues: ClueState;
}>

export const PuzzlesList = ({clues}: Props) => {
    if (clues.isLoading) {
        return <div>Loading...</div>
    } else if (clues.clues.length > 0) {
        return <ListGroup className="clickable">
            {clues.clues.map(clue =>
                <LinkContainer to={`/staff/clues/${clue.tableOfContentId}`}
                    key={clue.tableOfContentId}>
                    <ListGroupItem>
                        <ClueIcon clue={clue} /> {clue.submittableTitle} ({clue.sortOrder})
                    </ListGroupItem>
                </LinkContainer>
            )}
        </ListGroup>;
    } else {
        return <div>There are no clues for this event</div>;
    }
};