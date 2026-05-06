import moment from 'moment';

import { StaffClue } from 'modules/staff/clues';

type Props = Readonly<{
    clue: StaffClue;
}>;

export const ClueLogistics = ({ clue }: Props) => {
    const hasTimingData = !!clue.openTime || !!clue.closingTime || !!clue.parSolveTime;

    return (
        <div>
            {hasTimingData ? (
                <>
                    {!!clue.openTime && <div>Puzzle opens at {moment.utc(clue.openTime).local().format('dddd HH:mm')}</div>}
                    {!!clue.closingTime && <div>Puzzle closes at {moment.utc(clue.closingTime).local().format('dddd HH:mm')}</div>}
                    {!!clue.parSolveTime && <div>Expected solve time is {clue.parSolveTime} minutes</div>}
                </>
            ) : (
                <div className="text-muted">No timing data is configured for this puzzle.</div>
            )}
        </div>
    );
};
