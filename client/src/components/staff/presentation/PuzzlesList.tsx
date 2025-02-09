import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { StaffClue } from 'modules/staff/clues';
import { ClueIcon } from './ClueIcon';
import { useStaffClues } from 'service/staff/clues';
import { useSelector } from 'react-redux';
import { getEventInstanceId } from 'modules';

export const PuzzlesList = () => {
    const eventInstanceId = useSelector(getEventInstanceId);
    const { isPending, error, data, isFetching } = useStaffClues(eventInstanceId);

    if (isPending) {
        return <div>Loading...</div>;
    } else if (data.length > 0) {
        return (
            <ListGroup className="clickable">
                {data.map((clue: StaffClue) => (
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
