import DialogRenderProp from 'components/staff/dialogs/DialogRenderProp';
import SimpleListForm from 'components/staff/dialogs/SimpleListForm';
import { getCluesModule } from 'modules/staff';
import { Answer, StaffClue } from 'modules/staff/clues';
import { FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { UnlockedPuzzle } from '../UnlockedPuzzle';
import { addAchievementUnlockToAnswer, deleteAchievementUnlockFromAnswer, getAchievementsModule } from 'modules/staff/achievements';
import { AnswerContent } from './AnswerContent';
import { ContentForm } from 'components/staff/dialogs';
import { addContentToAnswer, addPuzzleUnlock, deleteContentFromAnswer, deletePuzzleUnlock } from 'modules/staff/clues/service';
import { UnlockedAchievement } from '../UnlockedAchievement';

type Props = Readonly<{
    tableOfContentId: string;
    answer: Answer;
}>;

export const PuzzleUnlocks = ({ tableOfContentId, answer }: Props) => {
    const clues = useSelector(getCluesModule);
    const achievements = useSelector(getAchievementsModule);
    const dispatch = useDispatch();

    const unlockableClues = clues.data.filter(
        (clue: StaffClue) => clue.tableOfContentId !== tableOfContentId && answer.unlockedClues.find((unlock) => unlock.tableOfContentId === clue.tableOfContentId) === undefined
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
                                    dispatch(addPuzzleUnlock(answer.answerId, tableOfContentId));
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
                        deleteUnlock={() => dispatch(deletePuzzleUnlock(answer.answerId, unlock.tableOfContentId))}
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
                                collection={achievements.data}
                                getItemKey={(achievement) => achievement.achievementId}
                                getItemValue={(achievement) => achievement.achievementId}
                                getItemLabel={(achievement) => achievement.name}
                                onSubmit={(achievementId) => {
                                    dispatch(addAchievementUnlockToAnswer(answer.answerId, achievementId));
                                    onComplete();
                                }}
                            />
                        )}
                    />
                    {answer.unlockedAchievements.map((achievement) => (
                        <UnlockedAchievement
                            key={achievement.achievementId}
                            unlockedAchievement={achievement}
                            deleteUnlock={(achievementId) => dispatch(deleteAchievementUnlockFromAnswer(answer.answerId, achievementId))}
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
                                    dispatch(addContentToAnswer(tableOfContentId, answer.answerId, content));
                                    onComplete();
                                }}
                            />
                        )}
                    />
                    {!!answer.additionalContent && (
                        <AnswerContent content={answer.additionalContent} deleteContent={() => dispatch(deleteContentFromAnswer(tableOfContentId, answer.answerId))} />
                    )}
                </div>
            </div>
        );
    } else {
        return '';
    }
};
