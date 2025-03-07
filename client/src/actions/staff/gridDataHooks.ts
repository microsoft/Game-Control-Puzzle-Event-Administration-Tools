import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getGridModule, GridCellData, GridTeam } from 'modules/staff';
import { getStaffGrid } from 'modules/staff/grid/service';
import { StaffClue } from 'modules/staff/clues';

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
    const dispatch = useDispatch();
    const gridModule = useSelector(getGridModule);
    const isLoading = gridModule.isLoading;

    let teams = gridModule?.data?.teams;
    let clues = gridModule?.data?.clues;

    const teamData = useMemo(() => {
        const plotSubmittableIds = clues.filter((clue) => clue.submittableType === 'Plot').map((clue) => clue.submittableId);

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
                            //isSkipped is already part of puzzle so we don't need the shortcut
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
    }, [gridModule, hidePlot]);

    const clueData = useMemo(() => {
        let clueData: ExtendedGridClue = {};
        if (clues) {
            clueData = Object.assign({}, ...clues.map((clue) => ({ [clue.submittableId]: clue })));
        }
        return clueData;
    }, [gridModule]);

    const refreshGrid = useCallback(() => {
        dispatch(getStaffGrid());
    }, [dispatch]);

    useEffect(() => {
        refreshGrid();

        if (!noRefresh) {
            const timer = setInterval(() => refreshGrid(), fastRefresh ? 5000 : 15000);
            return () => clearInterval(timer);
        }
    }, [fastRefresh, noRefresh, refreshGrid]);

    return {
        data: {
            teams: teamData,
            clues: clueData,
            isLoading,
        },
        refresh: refreshGrid,
    };
};
