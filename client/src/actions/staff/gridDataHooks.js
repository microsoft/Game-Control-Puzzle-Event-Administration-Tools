import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"
import _ from 'lodash';

import { getGridModule } from "modules/staff";
import { getStaffGrid } from "modules/staff/grid/service";

export const useStaffGridData = ({ noRefresh, fastRefresh, hidePlot }) => {
    const dispatch = useDispatch();
    const gridModule = useSelector(getGridModule);
    const isLoading = gridModule.isLoading;

    let teams = gridModule?.data?.teams;
    let clues = gridModule?.data?.clues;

    const plotSubmittableIds = clues
        .filter(clue => clue.submittableType === "Plot")
        .map(clue => clue.submittableId);

    let teamData = undefined;
    if (teams) {
        teamData = teams.map(team => {
            if (team.teamGridData) {
                if (hidePlot) {
                    team.teamGridData = team.teamGridData.filter(
                        (puzzle) => {
                            return !plotSubmittableIds.includes(puzzle.clueId);
                        }
                    );
                }
                let puzzles = team.teamGridData.map(
                    (puzzle) => {
                        return {
                            ...puzzle,
                            //isSkipped is part of puzzle
                            isActive: !puzzle.isSkipped && puzzle.startTime && !puzzle.solveTime,
                            isSolved: !puzzle.isSkipped && puzzle.startTime && puzzle.solveTime,
                            isNotStarted: !puzzle.isSkipped && !puzzle.startTime && !puzzle.endTime,
                        }
                    });
                let currentPuzzle = _.first(_.filter(puzzles, p => p.isActive).sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime)));

                return { ...team, puzzles, currentPuzzle };
            } else {
                return team;
            }
        });
    }

    let clueData = {};
    if (clues)
    {
        clueData = Object.assign(
            {},
            ...clues.map(clue => (
                {[clue.submittableId]: clue }
            ))
        );
    }

    const refreshGrid = useCallback(() => 
        dispatch(getStaffGrid()),
    [dispatch]);

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
            isLoading
        },
        refresh: refreshGrid
    };
}