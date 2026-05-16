import { useState } from 'react';
import { Form } from 'react-bootstrap';
import moment from 'moment';
import 'moment-timezone';

import { useStaffGridQuery, useUnlockClueForTeamMutation, useRelockClueForTeamMutation } from 'modules/staff/grid/queries';

import { PuzzleColumn, TeamColumn } from './grid/GridColumns';
import { GridCell } from './grid/GridCell';

export const StaffGrid = () => {
    document.title = 'Game Control - The Grid';

    const [hideCompletedClues, setHideCompletedClues] = useState(false);
    const [hidePlot, setHidePlot] = useState(true);
    const [hideTestTeams, setHideTestTeams] = useState(true);
    const [isVirtual] = useState(true);

    const { data: gridData, isLoading } = useStaffGridQuery({ refetchInterval: 30000 });
    const unlockClue = useUnlockClueForTeamMutation();
    const relockClue = useRelockClueForTeamMutation();

    if (!gridData) {
        if (isLoading) {
            return <div>Loading grid data...</div>;
        }
        return <div>No grid data available</div>;
    } else {
        const visibleClueIds = gridData.clues
            .filter((clue) => {
                if (hidePlot && clue.submittableType === 'Plot') {
                    return false;
                }
                if (hideCompletedClues && gridData.completedClues.includes(clue.tableOfContentId)) {
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
                    !isVirtual && <div>Big Clock: {moment.utc(gridData.latestEndTime).fromNow()}</div>
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
                            {gridData.clues
                                .filter((c) => visibleClueIds.includes(c.submittableId))
                                .map((puzzle) => (
                                    <PuzzleColumn key={puzzle.submittableId} puzzle={puzzle} />
                                ))}
                        </tr>

                        {gridData.teams
                            .filter((x) => !x.isTestTeam || !hideTestTeams)
                            .map((team) => (
                                <tr key={team.teamId}>
                                    <TeamColumn team={team} />
                                    {team.teamGridData.map((teamGrid) => {
                                        const selectedPuzzle = gridData.clues.find((x) => x.tableOfContentId === teamGrid.tableOfContentId);
                                        const selectedTeam = gridData.teams.find((x) => x.teamId === teamGrid.teamId);

                                        if (!visibleClueIds.includes(teamGrid.clueId)) {
                                            return null;
                                        } else {
                                            return (
                                                <GridCell
                                                    key={team.teamId + teamGrid.tableOfContentId}
                                                    solveData={teamGrid}
                                                    puzzleTitle={selectedPuzzle ? selectedPuzzle.submittableTitle : 'UNKNOWN PUZZLE'}
                                                    teamName={selectedTeam ? selectedTeam.name : 'UNKNOWN TEAM'}
                                                    clues={gridData.clues}
                                                    onRelock={() => relockClue.mutate({ teamId: teamGrid.teamId, tableOfContentId: teamGrid.tableOfContentId })}
                                                    onUnlock={() => unlockClue.mutate({ teamId: teamGrid.teamId, tableOfContentId: teamGrid.tableOfContentId, reason: 'GcUnlock' })}
                                                    onSkip={() => unlockClue.mutate({ teamId: teamGrid.teamId, tableOfContentId: teamGrid.tableOfContentId, reason: 'Skip' })}
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
