import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { StaffClue } from 'modules/staff/clues';

import { ClueIcon } from './ClueIcon';

type Props = Readonly<{
    clues: StaffClue[];
    isLoading: boolean;
}>;

export const PuzzlesList = ({ clues, isLoading }: Props) => {
    if (isLoading) {
        return <div>Loading...</div>;
    } else if (clues.length > 0) {
        return (
            <ListGroup className="clickable">
                {clues.map((clue) => (
                    <LinkContainer to={`/staff/clues/${clue.tableOfContentId}`} key={clue.tableOfContentId}>
                        <ListGroupItem>
                            <ClueIcon clue={clue} /> {clue.submittableTitle} ({clue.sortOrder})
                        </ListGroupItem>
                    </LinkContainer>
                ))}
            </ListGroup>
        );
    } else {
        return <div>There are no clues for this event</div>;
    }
};
