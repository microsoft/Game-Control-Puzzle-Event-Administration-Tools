import { useState } from 'react';
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FaEdit, FaPlus, FaRegCopy, FaTrashAlt } from 'react-icons/fa';

import { areAnswersEqual, compareAnswers } from 'modules/staff/clues/comparators';
import { useStaffAchievementsQuery } from 'modules/staff/achievements/queries';

import { AdditionalContent } from './AdditionalContent';
import { AnswerForm, ContentForm } from '../dialogs';
import { UnlockedAchievement } from './UnlockedAchievement';
import { UnlockedPuzzle } from './UnlockedPuzzle';
import SimpleListFormGroupApply from '../dialogs/SimpleListFormGroupApply';
import DialogRenderProp from '../dialogs/DialogRenderProp';

import { AnswerText } from './answers/AnswerText';
import { useStaffTeamsQuery } from 'modules/staff/teams/queries';
import { Answer, StaffClue } from 'modules/staff/clues';
import {
    useAddAchievementUnlockMutation,
    useAddAnswerMutation,
    useAddContentToAnswerMutation,
    useAddPuzzleUnlockMutation,
    useDeleteAchievementUnlockMutation,
    useDeleteAnswerMutation,
    useDeleteContentFromAnswerMutation,
    useDeletePuzzleUnlockMutation,
    useStaffCluesQuery,
} from 'modules/staff/clues/queries';
import { Achievement } from 'modules/types';
import { PuzzleUnlocks } from './answers/PuzzleUnlocks';

type Props = Readonly<{
    clue: StaffClue;
}>;

type GroupedAnswer = Answer &
    Readonly<{
        answerIds: string[];
        teamIds: string[];
    }>;

const PuzzleAnswersList = ({ clue }: Props) => {
    const [enableGrouping, setEnableGrouping] = useState(true);
    const { data: achievements = [] } = useStaffAchievementsQuery();
    const { data: teamsData = [] } = useStaffTeamsQuery();
    const { data: cluesData = [] } = useStaffCluesQuery();
    const addAnswerMut = useAddAnswerMutation();
    const deleteAnswer = useDeleteAnswerMutation();
    const addPuzzleUnlockMut = useAddPuzzleUnlockMutation();
    const deletePuzzleUnlockMut = useDeletePuzzleUnlockMutation();
    const addAchUnlockMut = useAddAchievementUnlockMutation();
    const deleteAchUnlockMut = useDeleteAchievementUnlockMutation();
    const addContentToAnswerMut = useAddContentToAnswerMutation();
    const deleteContentFromAnswerMut = useDeleteContentFromAnswerMutation();

    const deletePuzzleAnswer = (answerId: string, tableOfContentId: string) => {
        deleteAnswer.mutate({ tableOfContentId, answerId });
    };

    const renderGroupedAnswerText = (groupedAnswer: GroupedAnswer) => {
        const teams = GetTeamSet(groupedAnswer.teamIds);
        teams.sort((teamA, teamB) => teamA.name.localeCompare(teamB.name));
        return (
            <span>
                <h4>
                    <strong>{groupedAnswer.answerText}</strong>
                </h4>
                <div>Applies to {groupedAnswer.teamIds.length} teams:</div>
                <ul>
                    {teams.map((team) => (
                        <li key={team.teamId}>{team.name}</li>
                    ))}
                </ul>
            </span>
        );
    };

    const GetTeamSet = (teamIds: string[]) => {
        const teamSet = [];
        for (let i = 0; i < teamIds.length; i++) {
            const team = teamsData.find((candidate) => candidate.teamId === teamIds[i]);
            if (!!team) {
                teamSet.push(team);
            }
        }

        return teamSet;
    };

    const GetTeamApplyCollection = (teamIds: string[], answerIds: string[]) => {
        const teamsSet = GetTeamSet(teamIds);
        const result = [];
        for (let i = 0; i < teamsSet.length; i++) {
            if (teamsSet[i] !== undefined) {
                result.push({
                    name: teamsSet[i].name,
                    key: teamsSet[i].teamId,
                    value: answerIds[i],
                });
            }
        }
        return result;
    };

    const GetGroupedAnswers = (groupingEnabled: boolean) => {
        const allAnswers = [...clue.answers];

        allAnswers.sort(compareAnswers);

        const standAloneAnswers = [];
        const groupedAnswers = [];
        if (!groupingEnabled) {
            for (let answerIndex = 0; answerIndex < allAnswers.length; answerIndex++) {
                standAloneAnswers.push(allAnswers[answerIndex]);
            }
        } else {
            const isAnswerAllocated = new Array(allAnswers.length);
            isAnswerAllocated.fill(false);
            for (let i = 0; i < allAnswers.length; i++) {
                if (!isAnswerAllocated[i]) {
                    isAnswerAllocated[i] = true;
                    if (allAnswers[i].teamId === null) {
                        standAloneAnswers.push(allAnswers[i]);
                    } else {
                        const answersInGroup = [i];
                        for (let j = 0; j < allAnswers.length; j++) {
                            if (!isAnswerAllocated[j] && allAnswers[j].teamId !== null && areAnswersEqual(allAnswers[i], allAnswers[j])) {
                                answersInGroup.push(j);
                                isAnswerAllocated[j] = true;
                            }
                        }

                        if (answersInGroup.length === 1) {
                            standAloneAnswers.push(allAnswers[i]);
                        } else {
                            const groupedAnswer: GroupedAnswer = {
                                additionalContent: allAnswers[i].additionalContent,
                                answerIds: [],
                                answerResponse: allAnswers[i].answerResponse,
                                answerText: allAnswers[i].answerText,
                                isCorrectAnswer: allAnswers[i].isCorrectAnswer,
                                isHidden: allAnswers[i].isHidden,
                                answerId: allAnswers[i].answerId,
                                teamIds: [],
                                unlockedAchievements: allAnswers[i].unlockedAchievements,
                                unlockedClues: allAnswers[i].unlockedClues,
                            };
                            for (let k = 0; k < answersInGroup.length; k++) {
                                const answerToMerge = allAnswers[answersInGroup[k]];
                                groupedAnswer.answerIds.push(answerToMerge.answerId);

                                if (answerToMerge.teamId) {
                                    groupedAnswer.teamIds.push(answerToMerge.teamId);
                                }
                            }
                            groupedAnswers.push(groupedAnswer);
                        }
                    }
                }
            }
        }
        return {
            standAloneAnswers,
            groupedAnswers,
        };
    };

    const renderGroupUnlocks = (groupedAnswer: GroupedAnswer) => {
        const unlockableClues = cluesData.filter(
            (nextClue) =>
                nextClue.tableOfContentId !== clue.tableOfContentId &&
                groupedAnswer.unlockedClues.find((unlock) => unlock.tableOfContentId === nextClue.tableOfContentId) === undefined,
        );

        if (groupedAnswer.unlockedClues !== null) {
            return (
                <div>
                    <div>
                        Puzzles Unlocked by Answer &nbsp;
                        <DialogRenderProp
                            renderTitle={() => 'Add Unlock To Puzzle'}
                            renderButton={() => <FaPlus />}
                            renderBody={(onComplete) => (
                                <SimpleListFormGroupApply
                                    label="Add Puzzle to Unlock"
                                    submitText="Add"
                                    collection={unlockableClues}
                                    applyCollection={GetTeamApplyCollection(groupedAnswer.teamIds, groupedAnswer.answerIds)}
                                    getItemKey={(puzzle: StaffClue) => puzzle.tableOfContentId}
                                    getItemValue={(puzzle: StaffClue) => puzzle.tableOfContentId}
                                    getItemLabel={(puzzle: StaffClue) => puzzle.submittableTitle}
                                    onSubmit={(tableOfContentId: string, applyToCollection: string[]) => {
                                        applyToCollection.forEach((answerId: string) => addPuzzleUnlockMut.mutate({ answerId, tableOfContentId }));
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                    </div>
                    {groupedAnswer.unlockedClues.map((unlock) => (
                        <UnlockedPuzzle
                            key={unlock.tableOfContentId}
                            unlockedPuzzle={unlock}
                            deleteUnlock={() =>
                                groupedAnswer.answerIds?.forEach((answerId) => deletePuzzleUnlockMut.mutate({ answerId, tableOfContentId: unlock.tableOfContentId }))
                            }
                        />
                    ))}
                    <div>
                        Achievements Unlocked by Answer
                        <DialogRenderProp
                            renderTitle={() => 'Add Achievement Unlock'}
                            renderButton={() => <FaPlus />}
                            renderBody={(onComplete) => (
                                <SimpleListFormGroupApply
                                    label="Add Achievement Unlock"
                                    submitText="Add"
                                    groupLabel="teams"
                                    collection={achievements}
                                    applyCollection={GetTeamApplyCollection(groupedAnswer.teamIds, groupedAnswer.answerIds)}
                                    getItemKey={(achievement: Achievement) => achievement.achievementId}
                                    getItemValue={(achievement: Achievement) => achievement.achievementId}
                                    getItemLabel={(achievement: Achievement) => achievement.name}
                                    onSubmit={(achievementId: string, applyToCollection: string[]) => {
                                        applyToCollection.forEach((answerId) => addAchUnlockMut.mutate({ answerId, achievementId }));
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        {groupedAnswer.unlockedAchievements.map((achievement) => (
                            <UnlockedAchievement
                                key={achievement.achievementId}
                                unlockedAchievement={achievement}
                                deleteUnlock={() =>
                                    groupedAnswer.answerIds?.forEach((answerId) =>
                                        deleteAchUnlockMut.mutate({ answerId, achievementId: achievement.achievementId }),
                                    )
                                }
                            />
                        ))}
                    </div>
                    <div>
                        Additional Content
                        <DialogRenderProp
                            renderTitle={() => 'Add Additional Content Unlock'}
                            renderButton={() => <FaPlus />}
                            renderBody={(onComplete) => (
                                <ContentForm
                                    onSubmit={(content) => {
                                        groupedAnswer.answerIds?.forEach((answerId) =>
                                            addContentToAnswerMut.mutate({ tableOfContentId: clue.tableOfContentId, answerId, contentTemplate: content }),
                                        );
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        {_renderGroupedAnswerContent(groupedAnswer)}
                    </div>
                </div>
            );
        } else {
            return '';
        }
    };

    const _renderGroupedAnswerContent = (groupedAnswer: GroupedAnswer) => {
        if (!!groupedAnswer.additionalContent) {
            return (
                <div>
                    <AdditionalContent content={groupedAnswer.additionalContent} />
                    <Button
                        onClick={() =>
                            groupedAnswer.answerIds?.forEach((answerId: string) =>
                                deleteContentFromAnswerMut.mutate({ tableOfContentId: clue.tableOfContentId, answerId }),
                            )
                        }
                    >
                        Remove Content
                    </Button>
                </div>
            );
        } else {
            return <div>There is no additional content for this answer.</div>;
        }
    };

    const renderFallback = (dividedAnswerGroups: any) => {
        if (dividedAnswerGroups.groupedAnswers.length > 0) {
            return (
                <div style={{ position: 'absolute', left: 'calc(100% - 140px)', display: 'inline' }}>
                    <Button size="sm" onClick={() => setEnableGrouping(false)}>
                        Disable Grouping
                    </Button>
                </div>
            );
        }
        return null;
    };

    if (clue.answers !== null && clue.answers.length > 0) {
        const dividedAnswerGroups = GetGroupedAnswers(enableGrouping);
        return (
            <span>
                {renderFallback(dividedAnswerGroups)}
                <ListGroup>
                    {dividedAnswerGroups.standAloneAnswers.map((answer) => (
                        <ListGroupItem key={answer.answerId} variant={answer.isCorrectAnswer ? 'success' : 'danger'}>
                            <div style={{ textAlign: 'left' }}>
                                <AnswerText answer={answer} />
                                <div>
                                    Response: <em>{answer.answerResponse}</em>
                                </div>
                                <PuzzleUnlocks answer={answer} tableOfContentId={clue.tableOfContentId} />
                            </div>
                            <div style={{ display: 'flow', justifyContent: 'space-between' }}>
                                <DialogRenderProp
                                    variant="primary"
                                    renderTitle={() => 'Update Response'}
                                    renderButton={() => (
                                        <>
                                            <FaEdit /> Update Response
                                        </>
                                    )}
                                    renderBody={(onComplete) => (
                                        <AnswerForm
                                            answer={{ ...answer, isTeamSpecific: !!answer.teamId }}
                                            teams={teamsData}
                                            onSubmit={(updatedAnswer) => {
                                                addAnswerMut.mutate({ tableOfContentId: clue.tableOfContentId, answerTemplate: updatedAnswer });
                                                onComplete();
                                            }}
                                        />
                                    )}
                                />
                                <DialogRenderProp
                                    variant="primary"
                                    renderTitle={() => 'Copy Answer'}
                                    renderButton={() => (
                                        <>
                                            <FaRegCopy /> Clone Answer
                                        </>
                                    )}
                                    renderBody={(onComplete) => (
                                        <AnswerForm
                                            answer={{ ...answer, answerId: undefined, isTeamSpecific: !!answer.teamId }}
                                            teams={teamsData}
                                            onSubmit={(updatedAnswer) => {
                                                addAnswerMut.mutate({ tableOfContentId: clue.tableOfContentId, answerTemplate: updatedAnswer });
                                                onComplete();
                                            }}
                                        />
                                    )}
                                />
                                <Button variant="danger" onClick={() => deletePuzzleAnswer(answer.answerId, clue.tableOfContentId)}>
                                    <FaTrashAlt /> Delete Answer
                                </Button>
                            </div>
                        </ListGroupItem>
                    ))}
                    {dividedAnswerGroups.groupedAnswers.map((groupedAnswer) => (
                        <ListGroupItem key={groupedAnswer.answerIds[0]} variant={groupedAnswer.isCorrectAnswer ? 'success' : 'danger'}>
                            <div style={{ textAlign: 'left' }}>
                                {renderGroupedAnswerText(groupedAnswer)}
                                <div>Response: {groupedAnswer.answerResponse}</div>
                                {renderGroupUnlocks(groupedAnswer)}
                            </div>
                            <div style={{ display: 'flow', justifyContent: 'center' }}>
                                <Button onClick={() => groupedAnswer.answerIds.forEach((answerId) => deletePuzzleAnswer(answerId, clue.tableOfContentId))}>
                                    Delete Answer
                                </Button>
                            </div>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </span>
        );
    } else if (clue.answers !== null && clue.answers.length === 0) {
        return <div>There are no answers for this clue</div>;
    } else {
        return <div>Loading answers for this clue... hold on.</div>;
    }
};

export default PuzzleAnswersList;
