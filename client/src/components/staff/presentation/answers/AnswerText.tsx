import { useSelector } from 'react-redux';

import { getStaffTeam } from 'modules/staff';
import { Answer } from 'modules/staff/clues';

type Props = Readonly<{
    answer: Answer;
}>;

export const AnswerText = ({ answer }: Props) => {
    const team = useSelector((state) => getStaffTeam(state, answer.teamId));

    if (team) {
        return (
            <h4>
                <strong>
                    ({team?.name ?? 'UNKNOWN'}) {answer.answerText}
                </strong>
            </h4>
        );
    } else {
        return (
            <h4>
                <strong>{answer.answerText}</strong>
                {answer.isHidden && (
                    <div>
                        <em>(This answer will not be shown to teams)</em>
                    </div>
                )}
            </h4>
        );
    }
};
