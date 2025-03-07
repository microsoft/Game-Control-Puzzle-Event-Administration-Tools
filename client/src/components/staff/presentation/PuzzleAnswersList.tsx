import { useState } from 'react';
import { Button, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaEdit, FaPlus, FaRegCopy, FaTrashAlt } from 'react-icons/fa';
import { connect, useDispatch } from 'react-redux';

import { areAnswersEqual, compareAnswers, getCluesModule, getStaffTeams, StaffTeam, useStaffTeams } from 'modules/staff';
import { addAnswerToClue, addContentToAnswer, addPuzzleUnlock, deleteClueAnswer, deleteContentFromAnswer, deletePuzzleUnlock } from 'modules/staff/clues/service';
import { fetchStaffAchievements, getAchievementsModule, addAchievementUnlockToAnswer, deleteAchievementUnlockFromAnswer, useStaffAchievements } from 'modules/staff/achievements';

import { AdditionalContent } from './AdditionalContent';
import { AnswerForm, ContentForm } from '../dialogs';
import { UnlockedAchievement } from './UnlockedAchievement';
import { UnlockedPuzzle } from './UnlockedPuzzle';
import SimpleListFormGroupApply from '../dialogs/SimpleListFormGroupApply';
import DialogRenderProp from '../dialogs/DialogRenderProp';

import { AnswerText } from './answers/AnswerText';
import { Answer, StaffClue, useStaffClues } from 'modules/staff/clues';
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
    const { staffAchievementsModule } = useStaffAchievements();
    const { teams } = useStaffTeams();
    const { cluesModule } = useStaffClues();
    const dispatch = useDispatch();

    const deletePuzzleAnswer = (answerId: string, tableOfContentId: string) => {
        dispatch(deleteClueAnswer(tableOfContentId, answerId));
    };

    const renderGroupedAnswerText = (groupedAnswer: GroupedAnswer) => {
        let teams = GetTeamSet(groupedAnswer.teamIds);
        teams.sort((teamA, teamB) => {
            return teamA.name.localeCompare(teamB.name);
        });
        return (
            <span>
                <h4>
                    <strong>{groupedAnswer.answerText}</strong>
                </h4>
                <div>Applies to {groupedAnswer.teamIds.length} teams:</div>
                <ul>
                    {teams.map((team) => (
                        <li>{team.name}</li>
                    ))}
                </ul>
            </span>
        );
    };

    const FindTeamName = (teamId: string) => {
        return teams.data.find((team) => team.teamId === teamId)?.name ?? 'UNKNOWN';
    };

    const GetTeamSet = (teamIds: string[]) => {
        const teamSet = [];
        for (var i = 0; i < teamIds.length; i++) {
            const team = teams.data.find((team) => team.teamId === teamIds[i]);
            if (!!team) {
                teamSet.push(team);
            }
        }

        return teamSet;
    };

    const GetTeamApplyCollection = (teamIds: string[], answerIds: string[]) => {
        const teamsSet = GetTeamSet(teamIds);
        const result = [];
        for (var i = 0; i < teamsSet.length; i++) {
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
        const allAnswers = clue.answers;

        /*        const allAnswers: GroupedAnswer[] = clue.answers.map((answer) => {
            const team = teams.data.find((team) => team.teamId === allAnswers[a].teamId);
            if (team) {
                return {
                    ...answer,
                    team: team,
                };
            } else {
                return answer;
            }
        });
*/

        allAnswers.sort(compareAnswers);

        let standAloneAnswers = [];
        let groupedAnswers = [];
        if (!groupingEnabled) {
            for (let answerIndex = 0; answerIndex < allAnswers.length; answerIndex++) {
                standAloneAnswers.push(allAnswers[answerIndex]);
            }
        } else {
            let isAnswerAllocated = new Array(allAnswers.length);
            isAnswerAllocated.fill(false);
            for (var i = 0; i < allAnswers.length; i++) {
                if (!isAnswerAllocated[i]) {
                    isAnswerAllocated[i] = true;
                    if (allAnswers[i].teamId === null) {
                        standAloneAnswers.push(allAnswers[i]);
                    } else {
                        let answersInGroup = [i];
                        for (var j = 0; j < allAnswers.length; j++) {
                            if (!isAnswerAllocated[j] && allAnswers[j].teamId !== null) {
                                if (areAnswersEqual(allAnswers[i], allAnswers[j])) {
                                    answersInGroup.push(j);
                                    isAnswerAllocated[j] = true;
                                }
                            }
                        }

                        if (answersInGroup.length === 1) {
                            standAloneAnswers.push(allAnswers[i]);
                        } else {
                            let groupedAnswer: GroupedAnswer = {
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
                            for (var k = 0; k < answersInGroup.length; k++) {
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
            standAloneAnswers: standAloneAnswers,
            groupedAnswers: groupedAnswers,
        };
    };

    const renderGroupUnlocks = (groupedAnswer: GroupedAnswer) => {
        const unlockableClues = cluesModule.data.filter(
            (clue) =>
                clue.tableOfContentId !== clue.tableOfContentId && groupedAnswer.unlockedClues.find((unlock) => unlock.tableOfContentId === clue.tableOfContentId) === undefined
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
                                        applyToCollection.map((answerId: string) => dispatch(addPuzzleUnlock(answerId, tableOfContentId)));
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
                            deleteUnlock={() => groupedAnswer.answerIds?.map((answerId) => dispatch(deletePuzzleUnlock(answerId, unlock.tableOfContentId)))}
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
                                    collection={staffAchievementsModule.data}
                                    applyCollection={GetTeamApplyCollection(groupedAnswer.teamIds, groupedAnswer.answerIds)}
                                    getItemKey={(achievement: Achievement) => achievement.achievementId}
                                    getItemValue={(achievement: Achievement) => achievement.achievementId}
                                    getItemLabel={(achievement: Achievement) => achievement.name}
                                    onSubmit={(achievementId: string, applyToCollection: string[]) => {
                                        applyToCollection.map((answerId) => dispatch(addAchievementUnlockToAnswer(answerId, achievementId)));
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        {groupedAnswer.unlockedAchievements.map((achievement) => (
                            <UnlockedAchievement
                                key={achievement.achievementId}
                                unlockedAchievement={achievement}
                                deleteUnlock={(achievementId) =>
                                    groupedAnswer.answerIds?.map((answerId) => dispatch(deleteAchievementUnlockFromAnswer(answerId, achievement.achievementId)))
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
                                        groupedAnswer.answerIds?.map((answerId) => dispatch(addContentToAnswer(clue.tableOfContentId, answerId, content)));
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
                    <Button onClick={() => groupedAnswer.answerIds?.map((answerId: string) => dispatch(deleteContentFromAnswer(clue.tableOfContentId, answerId)))}>
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
        return;
    };

    if (clue.answers !== null && clue.answers.length > 0) {
        let dividedAnswerGroups = GetGroupedAnswers(enableGrouping);
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
                                            teams={teams.data}
                                            onSubmit={(updatedAnswer) => {
                                                dispatch(addAnswerToClue(clue.tableOfContentId, updatedAnswer));
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
                                            teams={teams.data}
                                            onSubmit={(updatedAnswer) => {
                                                dispatch(addAnswerToClue(clue.tableOfContentId, updatedAnswer));
                                                onComplete();
                                            }}
                                        />
                                    )}
                                />
                                <Button variant="danger" onClick={() => dispatch(deletePuzzleAnswer(answer.answerId, clue.tableOfContentId))}>
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
                                <Button onClick={() => groupedAnswer.answerIds.map((answerId) => dispatch(deletePuzzleAnswer(answerId, clue.tableOfContentId)))}>
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
