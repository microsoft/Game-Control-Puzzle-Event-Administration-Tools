import { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import 'moment-timezone';

import { relockClueForTeam, unlockClueForTeam } from 'modules/staff/clues/service';
import { useStaffGrid } from 'modules/staff/grid';
import { useInterval } from 'utils/hooks';

import { PuzzleColumn, TeamColumn } from './grid/GridColumns';
import { GridCell } from './grid/GridCell';

export const StaffGrid = () => {
    document.title = 'Game Control - The Grid';

    const [hideCompletedClues, setHideCompletedClues] = useState(false);
    const [hidePlot, setHidePlot] = useState(true);
    const [hideTestTeams, setHideTestTeams] = useState(true);
    const [isVirtual] = useState(true);

    const dispatch = useDispatch();
    const { gridModule, getGrid } = useStaffGrid();

    useInterval(() => {
        getGrid();
    }, 30000);

    if (!gridModule.lastFetched) {
        return <div>No grid data available</div>;
    } else {
        const visibleClueIds = gridModule.data.clues
            .filter((clue) => {
                if (hidePlot && clue.submittableType === 'Plot') {
                    return false;
                }
                if (hideCompletedClues && gridModule.data.completedClues.includes(clue.tableOfContentId)) {
                    return false;
                } else {
                    return true;
                }
            })
            .map((clue) => clue.submittableId);

        return (
            <div style={{ width: '100%', overflowX: 'visible' }}>
                {
                    // Hide the big clock during virtual events.
                    !isVirtual && <div>Big Clock: {moment.utc(gridModule.data.latestEndTime).fromNow()}</div>
                }

                <table className="staffGridTable" style={{ overflowX: 'auto' }}>
                    <tbody>
                        <tr>
                            <th>
                                <Form.Check
                                    id="hideCompleted"
                                    type="switch"
                                    checked={hideCompletedClues}
                                    onChange={(event: any) => setHideCompletedClues(event.target.checked)}
                                    label="Hide Completed"
                                />
                                <Form.Check id="hidePlot" type="switch" checked={hidePlot} onChange={(event: any) => setHidePlot(event.target.checked)} label="Hide Plot" />
                                <Form.Check
                                    id="hideTestTeams"
                                    type="switch"
                                    checked={hideTestTeams}
                                    onChange={(event: any) => setHideTestTeams(event.target.checked)}
                                    label="Hide Test Teams"
                                />
                            </th>
                            {gridModule.data.clues
                                .filter((c) => visibleClueIds.includes(c.submittableId))
                                .map((puzzle) => (
                                    <PuzzleColumn key={puzzle.submittableId} puzzle={puzzle} />
                                ))}
                        </tr>

                        {gridModule.data.teams
                            .filter((x) => !x.isTestTeam || !hideTestTeams)
                            .map((team) => (
                                <tr key={team.teamId}>
                                    <TeamColumn team={team} />
                                    {team.teamGridData.map((teamGrid) => {
                                        const selectedPuzzle = gridModule.data.clues.find((x) => x.tableOfContentId === teamGrid.tableOfContentId);
                                        const selectedTeam = gridModule.data.teams.find((x) => x.teamId === teamGrid.teamId);

                                        if (!visibleClueIds.includes(teamGrid.clueId)) {
                                            return null;
                                        } else {
                                            return (
                                                <GridCell
                                                    key={team.teamId + teamGrid.tableOfContentId}
                                                    solveData={teamGrid}
                                                    puzzleTitle={selectedPuzzle ? selectedPuzzle.submittableTitle : 'UNKNOWN PUZZLE'}
                                                    teamName={selectedTeam ? selectedTeam.name : 'UNKNOWN TEAM'}
                                                    clues={gridModule.data.clues}
                                                    onRelock={() => dispatch(relockClueForTeam(teamGrid.teamId, teamGrid.tableOfContentId))}
                                                    onUnlock={() => dispatch(unlockClueForTeam(teamGrid.teamId, teamGrid.tableOfContentId, 'GcUnlock'))}
                                                    onSkip={() => dispatch(unlockClueForTeam(teamGrid.teamId, teamGrid.tableOfContentId, 'Skip'))}
                                                />
                                            );
                                        }
                                    })}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        );
    }
};
