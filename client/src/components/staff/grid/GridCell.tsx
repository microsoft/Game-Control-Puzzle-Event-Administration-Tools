import { MdLock } from 'react-icons/md';
import moment from 'moment';
import 'moment-timezone';

import { GridCellData } from 'modules/staff/grid';
import DialogRenderProp from '../dialogs/DialogRenderProp';
import { GridUnlockedPopup, GridUnlockablePopup } from './GridPopups';

type Props = Readonly<{
    teamName: string;
    puzzleTitle: string;
    solveData: GridCellData;
    clues: any[];
    onRelock: () => void;
    onUnlock: () => void;
    onSkip: () => void;
}>;

export const GridCell = ({ solveData, teamName, clues, puzzleTitle, onRelock, onUnlock, onSkip }: Props) => {
    if (solveData.isSkipped) {
        // If the solve info is flagged as skipped, we've officially skipped the team over this puzzle
        return (
            <td key={solveData.clueId + solveData.teamId} style={{ backgroundColor: 'orange' }} className="staffGridCell staffGridCellIcon staffGridCellSkipped">
                <DialogRenderProp
                    variant="link"
                    renderTitle={() => `${teamName} has been skipped over ${puzzleTitle}`}
                    renderButton={() => (
                        <div>
                            <span role="img" aria-label="skipped">
                                &#x23E9;
                            </span>
                        </div>
                    )}
                    renderBody={(onComplete: () => void) => <GridUnlockedPopup solveData={solveData} onRelock={onRelock} clues={clues} onComplete={onComplete} />}
                />
            </td>
        );
    } else if (solveData.startTime === null && solveData.predictedStart === null) {
        // If we have no start time nor a predicted start time, this is locked for the team and there is no
        // way for them to unlock it without GC doing it for them
        return (
            <td key={solveData.clueId + solveData.teamId} className="staffGridCell staffGridCellLocked">
                <DialogRenderProp
                    variant="link"
                    renderTitle={() => `${teamName} has no path to unlock ${puzzleTitle}`}
                    renderButton={() => (
                        <div className="staffGridUnreachable">
                            <MdLock />
                        </div>
                    )}
                    renderBody={(onComplete: () => void) => <GridUnlockablePopup solveData={solveData} onUnlock={onUnlock} onSkip={onSkip} clues={clues} onComplete={onComplete} />}
                />
            </td>
        );
    } else if (solveData.startTime === null && solveData.predictedStart !== null) {
        // If we have no start time but DO have a predicted time, this is locked for a team but there's
        // a path for them to unlock it
        const clue = clues.find((x) => x.tableOfContentId === solveData.tableOfContentId);

        let backgroundColor = 'white';

        if (clue) {
            if (clue.openTime) {
                if (moment.utc(clue.openTime).diff(moment.utc(solveData.predictedStart)) > 0) {
                    backgroundColor = 'pink';
                }
            }

            if (clue.closingTime) {
                if (moment.utc(clue.closingTime).diff(moment.utc(solveData.predictedStart)) < 0) {
                    backgroundColor = 'pink';
                }
            }
        }

        return (
            <td
                key={solveData.clueId + solveData.teamId}
                className="staffGridCell staffGridCellTime staffGridCellFuture"
                style={{ backgroundColor: backgroundColor }}
                title="predicted"
            >
                <DialogRenderProp
                    variant="link"
                    size="sm"
                    renderTitle={() => `${teamName} will eventually unlock ${puzzleTitle}`}
                    renderButton={() => <div>ETA: {moment.utc(solveData.predictedStart).local().format('hh:mm')}</div>}
                    renderBody={(onComplete: () => void) => <GridUnlockablePopup clues={clues} solveData={solveData} onUnlock={onUnlock} onSkip={onSkip} onComplete={onComplete} />}
                />
            </td>
        );
    } else if (solveData.solveTime !== null) {
        // If we have a solve time then the team has solved the puzzle
        return (
            <td key={solveData.clueId + solveData.teamId} className="staffGridCell staffGridCellSolved staffGridCellTime" style={{ backgroundColor: 'green' }}>
                {moment.utc(moment.duration(moment.utc(solveData.solveTime).diff(moment.utc(solveData.startTime))).as('milliseconds')).format('HH:mm:ss')}
            </td>
        );
    } else {
        // Hopefully the only other condition here is that the start time is non null. The puzzle
        // has been unlocked and not solved
        const clue = clues.find((x) => x.tableOfContentId === solveData.tableOfContentId);

        let badge: JSX.Element = <></>;
        if (!!clue && !!clue.parSolveTime) {
            if (clue.submittableType.trim() === 'locunlock' && moment.duration(moment.utc().diff(moment.utc(solveData.startTime))).asMinutes() > clue.parSolveTime + 15) {
                badge = (
                    <>
                        &nbsp;
                        <span className="badge badge-pill" title="Slow Team Alert">
                            !
                        </span>
                    </>
                );
            } else if (clue.submittableType.trim() === 'Puzzle' && moment.duration(moment.utc().diff(moment.utc(solveData.startTime))).asMinutes() > clue.parSolveTime + 30) {
                badge = (
                    <>
                        &nbsp;
                        <span className="badge badge-pill" title="Slow Team Alert">
                            !
                        </span>
                    </>
                );
            }
        }

        return (
            <td className="staffGridCell staffGridCellUnlocked staffGridCellTime" key={solveData.clueId + solveData.teamId} style={{ backgroundColor: 'yellow' }}>
                <DialogRenderProp
                    variant="link"
                    size="sm"
                    renderTitle={() => `${clue.submittableTitle} is currently unlocked for ${teamName}`}
                    renderButton={() => (
                        <div>
                            {moment.utc(moment.duration(moment.utc().diff(moment.utc(solveData.startTime))).as('milliseconds')).format('HH:mm:ss')}
                            {badge}
                        </div>
                    )}
                    renderBody={(onComplete: () => void) => <GridUnlockedPopup solveData={solveData} onRelock={onRelock} clues={clues} onComplete={onComplete} />}
                />
            </td>
        );
    }
};
