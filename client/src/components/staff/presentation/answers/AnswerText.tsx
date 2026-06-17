import { useStaffTeamQuery } from 'modules/staff/teams/queries';
import { Answer } from 'modules/staff/clues';

type Props = Readonly<{
    answer: Answer;
}>;

export const AnswerText = ({ answer }: Props) => {
    const { data: team } = useStaffTeamQuery(answer.teamId ?? undefined);

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
