import { ListGroup, ListGroupItem } from 'react-bootstrap';

import { StaffClue, useStaffClues } from 'modules/staff/clues';

const ClueDetails = ( { clue }: { clue: StaffClue }) => {
    if (clue.parSolveTime && clue.averageSolveTime) {
        return <div><strong>Difference from Estimation: </strong> {clue.averageSolveTime - clue.parSolveTime}</div>;
    }

    return null;
};

const ClueRatings = ( { clue }: { clue: StaffClue }) => {
    if (clue.ratings?.length > 0) {
        return <div><strong>Average Rating: </strong> {clue.ratings.map(a => a.rating).reduce(function (a,b) { return a + b;}) / clue.ratings.length}</div>
    }

    return null;
};

export const AdminEventSummary = () => {
    document.title = "Game Control - Event Summary";
    const { cluesModule } = useStaffClues();

    const getClueStyle = (clue: StaffClue) => {
        if (!!clue.parSolveTime && !!clue.averageSolveTime) {
            if (clue.averageSolveTime > clue.parSolveTime) {
                if (clue.averageSolveTime - clue.parSolveTime > 10) {
                    return 'danger';
                } else {
                    return undefined;
                }
            } else if (clue.averageSolveTime < clue.parSolveTime) {
                if (clue.parSolveTime - clue.averageSolveTime > 10) {
                    return 'success';
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        }
    }

    return (
        <div>
            <h4>Current Event Summary</h4>
            <ListGroup>
                {cluesModule.clues.filter((x: StaffClue) => x.submittableType.trim() === "Puzzle").map((clue: StaffClue) => 
                    <ListGroupItem key={clue.tableOfContentId} variant={getClueStyle(clue)}>
                        <strong>{clue.submittableTitle}</strong>
                        <div><strong>Par Solve Time:</strong> {clue.parSolveTime}</div>                        
                        <ClueDetails clue={clue} />
                        <ClueRatings clue={clue} />
                    </ListGroupItem>
                )}
            </ListGroup>
        </div>
    );
}
