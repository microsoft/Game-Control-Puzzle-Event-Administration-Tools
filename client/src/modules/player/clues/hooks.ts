import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RatingTemplate, SubmissionTemplate } from "./models";
import { getPlayerClues } from "./selectors";
import { fetchPlayerClues, rateClue, submitAnswer } from "./service";
import { shouldRefreshModule } from 'modules/types';

export const usePlayerClues = () => {
    const cluesModule = useSelector(getPlayerClues);
    const dispatch = useDispatch();

    useEffect(() => {
        if (shouldRefreshModule(cluesModule, 60)) {
            dispatch(fetchPlayerClues());
        }
    }, [cluesModule, dispatch]);

    return {
        cluesModule,
        submitAnswer: (tableOfContentId: string, submission: SubmissionTemplate) => dispatch(submitAnswer(tableOfContentId, submission)),
        rateClue: (tableOfContentId: string, rating: RatingTemplate) => dispatch(rateClue(tableOfContentId, rating)),
    };
};

export const usePlayerTakeOverClue = () => {
    const { cluesModule } = usePlayerClues();

    return cluesModule.data.find((clue) => clue.takeOver && !clue.isSolved);
}