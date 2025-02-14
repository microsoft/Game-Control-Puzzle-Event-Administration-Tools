import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { ClueIcon } from './ClueIcon';
import { StaffCluesState } from 'modules/staff/clues/staffCluesModule';

type Props = Readonly<{
    clues: StaffCluesState;
}>;

export const PuzzlesList = ({ clues }: Props) => {
    if (clues.isLoading) {
        return <div>Loading...</div>;
    } else if (clues.data.length > 0) {
        return (
            <ListGroup className="clickable">
                {clues.data.map((clue) => (
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
