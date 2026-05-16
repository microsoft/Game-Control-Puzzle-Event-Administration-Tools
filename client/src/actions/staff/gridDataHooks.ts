import { useMemo } from 'react';

import { GridCellData, GridTeam } from 'modules/staff';
import { StaffClue } from 'modules/staff/clues';
import { useStaffGridQuery } from 'modules/staff/grid/queries';

export type ExtendedGridTeam = GridTeam &
    Readonly<{
        currentPuzzle?: ExtendedGridCellData;
        puzzles?: ExtendedGridCellData[];
    }>;
export type ExtendedGridCellData = GridCellData &
    Readonly<{
        isActive: boolean;
        isSolved: boolean;
        isNotStarted: boolean;
    }>;

export type ExtendedGridClue = Readonly<{
    [id: string]: StaffClue;
}>;

export const useStaffGridData = ({ noRefresh, fastRefresh, hidePlot }: { noRefresh: boolean; fastRefresh: boolean; hidePlot: boolean }) => {
    const refetchInterval = noRefresh ? false : (fastRefresh ? 5000 : 15000);
    const { data: gridViewModel, isLoading, refetch } = useStaffGridQuery({ refetchInterval });

    const teams = gridViewModel?.teams;
    const clues = gridViewModel?.clues;

    const teamData = useMemo(() => {
        const plotSubmittableIds = (clues ?? []).filter((clue) => clue.submittableType === 'Plot').map((clue) => clue.submittableId);

        let teamData: ExtendedGridTeam[] = [];
        if (teams) {
            teamData = teams.map((team) => {
                if (team.teamGridData) {
                    let teamGridData = team.teamGridData;
                    if (hidePlot) {
                        teamGridData = team.teamGridData.filter((puzzle) => {
                            return !plotSubmittableIds.includes(puzzle.clueId);
                        });
                    }

                    const puzzles: ExtendedGridCellData[] = team.teamGridData.map((puzzle) => {
                        return {
                            ...puzzle,
                            isActive: !!(!puzzle.isSkipped && puzzle.startTime && !puzzle.solveTime),
                            isSolved: !!(!puzzle.isSkipped && puzzle.startTime && puzzle.solveTime),
                            isNotStarted: !!(!puzzle.isSkipped && !puzzle.startTime && !puzzle.solveTime),
                        };
                    });
                    const activePuzzles = puzzles
                        .filter((p: ExtendedGridCellData) => p.isActive)
                        .sort((a, b) => Date.parse(b.startTime!.toLocaleString()) - Date.parse(a.startTime!.toLocaleString()));
                    const currentPuzzle = activePuzzles.length > 0 ? activePuzzles[0] : undefined;

                    return { ...team, puzzles, currentPuzzle, teamGridData };
                } else {
                    return team;
                }
            });
        }

        return teamData;
    }, [teams, clues, hidePlot]);

    const clueData = useMemo(() => {
        let clueData: ExtendedGridClue = {};
        if (clues) {
            clueData = Object.assign({}, ...clues.map((clue) => ({ [clue.submittableId]: clue })));
        }
        return clueData;
    }, [clues]);

    return {
        data: {
            teams: teamData,
            clues: clueData,
            isLoading,
        },
        refresh: refetch,
    };
};
