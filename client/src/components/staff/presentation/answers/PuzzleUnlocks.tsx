import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import SimpleListForm from 'components/staff/dialogs/SimpleListForm';
import { Answer, StaffClue } from 'modules/staff/clues';
import { FaPlus } from 'react-icons/fa';
import { UnlockedPuzzle } from '../UnlockedPuzzle';
import { useStaffAchievementsQuery } from 'modules/staff/achievements/queries';
import { AnswerContent } from './AnswerContent';
import { ContentForm } from 'components/staff/dialogs';
import {
    useAddAchievementUnlockMutation,
    useAddContentToAnswerMutation,
    useAddPuzzleUnlockMutation,
    useDeleteAchievementUnlockMutation,
    useDeleteContentFromAnswerMutation,
    useDeletePuzzleUnlockMutation,
    useStaffCluesQuery,
} from 'modules/staff/clues/queries';
import { UnlockedAchievement } from '../UnlockedAchievement';

type Props = Readonly<{
    tableOfContentId: string;
    answer: Answer;
}>;

export const PuzzleUnlocks = ({ tableOfContentId, answer }: Props) => {
    const { data: cluesData = [] } = useStaffCluesQuery();
    const { data: achievements = [] } = useStaffAchievementsQuery();
    const addPuzzleUnlockMut = useAddPuzzleUnlockMutation();
    const deletePuzzleUnlockMut = useDeletePuzzleUnlockMutation();
    const addAchUnlockMut = useAddAchievementUnlockMutation();
    const deleteAchUnlockMut = useDeleteAchievementUnlockMutation();
    const addContentToAnswerMut = useAddContentToAnswerMutation();
    const deleteContentFromAnswerMut = useDeleteContentFromAnswerMutation();

    const unlockableClues = cluesData.filter(
        (clue: StaffClue) => clue.tableOfContentId !== tableOfContentId && answer.unlockedClues.find((unlock) => unlock.tableOfContentId === clue.tableOfContentId) === undefined,
    );

    if (answer.unlockedClues !== null) {
        return (
            <div>
                <div>
                    Puzzles Unlocked by Answer &nbsp;
                    <DialogRenderProp
                        renderTitle={() => 'Add Unlock To Puzzle'}
                        renderButton={() => <FaPlus />}
                        renderBody={(onComplete) => (
                            <SimpleListForm
                                label="Add Puzzle to Unlock"
                                submitText="Add"
                                collection={unlockableClues}
                                getItemKey={(puzzle) => puzzle.tableOfContentId}
                                getItemValue={(puzzle) => puzzle.tableOfContentId}
                                getItemLabel={(puzzle) => puzzle.submittableTitle}
                                onSubmit={(tableOfContentId) => {
                                    addPuzzleUnlockMut.mutate({ answerId: answer.answerId, tableOfContentId });
                                    onComplete();
                                }}
                            />
                        )}
                    />
                </div>
                {answer.unlockedClues.map((unlock) => (
                    <UnlockedPuzzle
                        key={unlock.tableOfContentId}
                        unlockedPuzzle={unlock}
                        deleteUnlock={() => deletePuzzleUnlockMut.mutate({ answerId: answer.answerId, tableOfContentId: unlock.tableOfContentId })}
                    />
                ))}
                <div>
                    Achievements Unlocked by Answer
                    <DialogRenderProp
                        renderTitle={() => 'Add Achievement Unlock'}
                        renderButton={() => <FaPlus />}
                        renderBody={(onComplete) => (
                            <SimpleListForm
                                label="Add Achievement Unlock"
                                submitText="Add"
                                collection={achievements}
                                getItemKey={(achievement) => achievement.achievementId}
                                getItemValue={(achievement) => achievement.achievementId}
                                getItemLabel={(achievement) => achievement.name}
                                onSubmit={(achievementId) => {
                                    addAchUnlockMut.mutate({ answerId: answer.answerId, achievementId });
                                    onComplete();
                                }}
                            />
                        )}
                    />
                    {answer.unlockedAchievements.map((achievement) => (
                        <UnlockedAchievement
                            key={achievement.achievementId}
                            unlockedAchievement={achievement}
                            deleteUnlock={(achievementId) => deleteAchUnlockMut.mutate({ answerId: answer.answerId, achievementId })}
                        />
                    ))}
                </div>
                <div>
                    Additional Content
                    <DialogRenderProp
                        renderTitle={() => 'Add Additional Content'}
                        renderButton={() => <FaPlus />}
                        renderBody={(onComplete) => (
                            <ContentForm
                                onSubmit={(content) => {
                                    addContentToAnswerMut.mutate({ tableOfContentId, answerId: answer.answerId, contentTemplate: content });
                                    onComplete();
                                }}
                            />
                        )}
                    />
                    {!!answer.additionalContent && (
                        <AnswerContent
                            content={answer.additionalContent}
                            deleteContent={() => deleteContentFromAnswerMut.mutate({ tableOfContentId, answerId: answer.answerId })}
                        />
                    )}
                </div>
            </div>
        );
    } else {
        return null;
    }
};
