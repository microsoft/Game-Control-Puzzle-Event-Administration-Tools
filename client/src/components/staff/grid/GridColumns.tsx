import {FaGift, FaPhone, FaUser} from "react-icons/fa";

import {StaffTeam} from "modules/staff";
import {ClueInstance} from "modules/staff/clues";
import {ClueIcon} from '../presentation/ClueIcon';

type PuzzleColumnProps = Readonly<{
    puzzle: any;
}>;

/**
 * Renders the grid column with information about the puzzle (i.e., title, available instances)
 */
export const PuzzleColumn = ({puzzle}: PuzzleColumnProps) => {

    const allInstances = puzzle.instances.length;
    const freeInstances = puzzle.instances.filter((x: ClueInstance) => !x.currentTeam && !x.needsReset).length;

    return <th key={puzzle.tableOfContentId} className="rotate">
        <div>
            <span className="badge badge-pill mr-1" title="Average Solve Time">{puzzle.averageSolveTime}m</span>
            <ClueIcon clue={puzzle}/>
            <div className="ml-1 staffGridPuzzleTitle" title={puzzle.submittableTitle}>{puzzle.submittableTitle}</div>
            <span className="badge badge-pill badge-primary">{puzzle.parSolveTime}</span>
            {allInstances > 0 && <span className="badge badge-pill badge-primary">{freeInstances}/{allInstances}</span>}
        </div>
    </th>
};

type TeamColumnProps = Readonly<{
    team: StaffTeam;
}>;

/**
 * Renders the grid column with information about the provided team.
 */
export const TeamColumn = ({team}: TeamColumnProps) => {
    const activeCall = team.callHistory.find(x => !x.callEnd);

    let teamIcon = null;
    if (activeCall) {
        if (activeCall.callType === "TeamFree") {
            teamIcon = <FaGift />;
        } else if (activeCall.callType === "TeamHelp") {
            teamIcon = <FaUser />;
        } else {
            teamIcon = <FaPhone />;
        }
    }

    return <td><div className="staffGridTeamName">{teamIcon}{team.name}</div></td>
}