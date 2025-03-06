import { Moment } from 'moment';
import { StaffTeam } from '../teams';
import { StaffClue } from '../clues';

export type GridCellData = Readonly<{
    teamId: string;
    clueId: string;
    tableOfContentId: string;
    startTime?: Moment;
    solveTime?: Moment;
    predictedStart?: Moment;
    predictedEnd?: Moment;
    isSkipped: boolean;
    hasNoAnswer: boolean;
    unlockedClues: string[];
}>;

export type GridTeam = Readonly<{
    teamGridData: GridCellData[];
}> &
    StaffTeam;

export type GridViewModel = Readonly<{
    teams: GridTeam[];
    clues: StaffClue[];
    completedClues: string[];
    gridNotes: string;
    theGrid: { [teamId: string]: { [tableOfContentId: string]: GridCellData } };
    latestEndTime?: Moment;
}>;
