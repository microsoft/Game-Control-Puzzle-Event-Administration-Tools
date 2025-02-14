import React from 'react';
import { Button, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import { FaEdit, FaPlus, FaRegCopy, FaTrashAlt } from 'react-icons/fa';
import { connect } from 'react-redux';

import { getCluesModule, getStaffTeams } from 'modules/staff';
import { addAnswerToClue, addContentToAnswer, addPuzzleUnlock, deleteClueAnswer, deleteContentFromAnswer, deletePuzzleUnlock } from 'modules/staff/clues/service';
import { fetchStaffAchievements, getAchievementsModule, addAchievementUnlockToAnswer, deleteAchievementUnlockFromAnswer } from 'modules/staff/achievements';

import { AdditionalContent } from '../presentation/AdditionalContent';
import { AnswerForm, ContentForm } from '../dialogs';
import { UnlockedAchievement } from './UnlockedAchievement';
import { UnlockedPuzzle } from './UnlockedPuzzle';
import SimpleListFormGroupApply from '../dialogs/SimpleListFormGroupApply';
import DialogRenderProp from '../dialogs/DialogRenderProp';

import { AnswerText } from './answers/AnswerText';

class PuzzleAnswersList extends React.Component {
    componentWillMount() {
        // TODO: Only fetch if out of date.
        this.props.getStaffAchievements();
        this.setState({ enableGrouping: true });
    }

    deletePuzzleAnswer(answerId, tableOfContentId) {
        this.props.deleteClueAnswer(tableOfContentId, answerId);
    }

    addPuzzleUnlock(answerId, tableOfContentId) {
        this.props.addPuzzleUnlock(answerId, tableOfContentId, null);
    }

    deletePuzzleUnlock(answerId, tableOfContentId) {
        this.props.deletePuzzleUnlock(answerId, tableOfContentId);
    }

    addOrUpdateAnswer(answer, tableOfContentId) {
        this.props.addAnswerToClue(tableOfContentId, answer);
    }

    renderGroupedAnswerText(groupedAnswer) {
        let teams = this.GetTeamSet(groupedAnswer.teamIds);
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
    }

    FindTeamName(teamGuid) {
        const team = this.FindTeam(teamGuid);
        return team !== undefined ? team.name : 'UNKNOWN';
    }

    renderGroupUnlocks(groupedAnswer) {
        const unlockableClues = this.props.clues.clues.filter(
            (clue) =>
                clue.tableOfContentId !== this.props.clue.tableOfContentId &&
                groupedAnswer.unlockedClues.find((unlock) => unlock.tableOfContentId === clue.tableOfContentId) === undefined
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
                                    applyCollection={this.GetTeamApplyCollection(groupedAnswer.teamIds, groupedAnswer.answerIds)}
                                    getItemKey={(puzzle) => puzzle.tableOfContentId}
                                    getItemValue={(puzzle) => puzzle.tableOfContentId}
                                    getItemLabel={(puzzle) => puzzle.submittableTitle}
                                    onSubmit={(tableOfContentId, applyToCollection) => {
                                        applyToCollection.map((answerId) => this.addPuzzleUnlock(answerId, tableOfContentId));
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
                            answerIds={groupedAnswer.answerIds}
                            deleteUnlock={() => groupedAnswer.answerIds.map((answerId) => this.deletePuzzleUnlock(answerId, unlock.tableOfContentId))}
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
                                    collection={this.props.achievements.data}
                                    applyCollection={this.GetTeamApplyCollection(groupedAnswer.teamIds, groupedAnswer.answerIds)}
                                    getItemKey={(achievement) => achievement.achievementId}
                                    getItemValue={(achievement) => achievement.achievementId}
                                    getItemLabel={(achievement) => achievement.name}
                                    onSubmit={(achievementId, applyToCollection) => {
                                        applyToCollection.map((answerId) => this.props.addAchievementUnlockToAnswer(answerId, achievementId));
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
                                    groupedAnswer.answerIds.map((answerId) => this.props.deleteAchievementUnlockFromAnswer(answerId, achievement.achievementId))
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
                                        groupedAnswer.answerIds.map((answerId) => this.props.addContentToAnswer(this.props.clue.tableOfContentId, answerId, content));
                                        onComplete();
                                    }}
                                />
                            )}
                        />
                        {this._renderGroupedAnswerContent(groupedAnswer)}
                    </div>
                </div>
            );
        } else {
            return '';
        }
    }

    _renderGroupedAnswerContent(groupedAnswer) {
        if (!!groupedAnswer.additionalContent) {
            return (
                <div>
                    <AdditionalContent content={groupedAnswer.additionalContent} />
                    <Button onClick={() => groupedAnswer.answerIds.map((answerId) => this.props.deleteContentFromAnswer(this.props.clue.tableOfContentId, answerId))}>
                        Remove Content
                    </Button>
                </div>
            );
        } else {
            return <div>There is no additional content for this answer.</div>;
        }
    }

    renderFallback(dividedAnswerGroups) {
        if (dividedAnswerGroups.groupedAnswers.length > 0) {
            return (
                <div style={{ position: 'absolute', left: 'calc(100% - 140px)', display: 'inline' }}>
                    <Button size="sm" onClick={() => this.setState({ enableGrouping: false })}>
                        Disable Grouping
                    </Button>
                </div>
            );
        }
        return;
    }

    render() {
        if (this.props.clue.answers !== null && this.props.clue.answers.length > 0) {
            let dividedAnswerGroups = this.GetGroupedAnswers(this.props.clue.answers, this.state.enableGrouping);
            return (
                <span>
                    {this.renderFallback(dividedAnswerGroups)}
                    <ListGroup>
                        {dividedAnswerGroups.standAloneAnswers.map((answer) => (
                            <ListGroupItem key={answer.answerId} variant={answer.isCorrectAnswer ? 'success' : 'danger'}>
                                <div style={{ textAlign: 'left' }}>
                                    <AnswerText answer={answer} clue={this.props.clue} />
                                    <div>
                                        Response: <em>{answer.answerResponse}</em>
                                    </div>
                                    <PuzzleUnlocks answer={answer} tableOfContentId={this.props.clue.tableOfContentId} />
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
                                                answer={answer}
                                                teams={this.props.teams.data}
                                                onSubmit={(updatedAnswer) => {
                                                    this.props.addAnswerToClue(this.props.clue.tableOfContentId, updatedAnswer);
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
                                                answer={{ ...answer, answerId: undefined }}
                                                teams={this.props.teams.data}
                                                onSubmit={(updatedAnswer) => {
                                                    this.props.addAnswerToClue(this.props.clue.tableOfContentId, updatedAnswer);
                                                    onComplete();
                                                }}
                                            />
                                        )}
                                    />
                                    <Button variant="danger" onClick={() => this.deletePuzzleAnswer(answer.answerId, this.props.clue.tableOfContentId)}>
                                        <FaTrashAlt /> Delete Answer
                                    </Button>
                                </div>
                            </ListGroupItem>
                        ))}
                        {dividedAnswerGroups.groupedAnswers.map((groupedAnswer) => (
                            <ListGroupItem key={groupedAnswer.answerIds[0]} variant={groupedAnswer.isCorrectAnswer ? 'success' : 'danger'}>
                                <div style={{ textAlign: 'left' }}>
                                    {this.renderGroupedAnswerText(groupedAnswer)}
                                    <div>Response: {groupedAnswer.answerResponse}</div>
                                    {this.renderGroupUnlocks(groupedAnswer)}
                                </div>
                                <div style={{ display: 'flow', justifyContent: 'center' }}>
                                    <Button onClick={() => groupedAnswer.answerIds.map((answerId) => this.deletePuzzleAnswer(answerId, this.props.clue.tableOfContentId))}>
                                        Delete Answer
                                    </Button>
                                </div>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                </span>
            );
        } else if (this.props.clue.answers !== null && this.props.clue.answers.length === 0) {
            return <div>There are no answers for this clue</div>;
        } else {
            return <div>Loading answers for this clue... hold on.</div>;
        }
    }

    GetTeamApplyCollection(teamIds, answerIds) {
        let teams = this.GetTeamSet(teamIds);
        let result = [];
        for (var i = 0; i < teams.length; i++) {
            if (teams[i] !== undefined) {
                result.push({
                    name: teams[i].name,
                    key: teams[i].teamId,
                    value: answerIds[i],
                });
            }
        }
        return result;
    }

    GetTeamSet(teamIds) {
        let teams = [];
        for (var i = 0; i < teamIds.length; i++) {
            let team = this.FindTeam(teamIds[i]);
            if (team !== undefined && team !== null) {
                teams.push(team);
            }
        }
        return teams;
    }

    FindTeam(teamId) {
        const team = this.props.teams.data.find((x) => x.teamId === teamId);
        return team;
    }

    GetGroupedAnswers(answers, groupingEnabled) {
        const allAnswers = this.props.clue.answers;

        for (var a = 0; a < allAnswers.length; a++) {
            allAnswers[a]['team'] = this.FindTeam(allAnswers[a].teamId);
        }
        allAnswers.sort(this.compareAnswers);

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
                                if (this.AnswersEqual(allAnswers[i], allAnswers[j])) {
                                    answersInGroup.push(j);
                                    isAnswerAllocated[j] = true;
                                }
                            }
                        }

                        if (answersInGroup.length === 1) {
                            standAloneAnswers.push(allAnswers[i]);
                        } else {
                            let groupedAnswer = {
                                additionalContent: allAnswers[i].additionalContent,
                                answerIds: [],
                                answerResponse: allAnswers[i].answerResponse,
                                answerText: allAnswers[i].answerText,
                                isCorrectAnswer: allAnswers[i].isCorrectAnswer,
                                teamIds: [],
                                unlockedAchievements: allAnswers[i].unlockedAchievements,
                                unlockedClues: allAnswers[i].unlockedClues,
                            };
                            for (var k = 0; k < answersInGroup.length; k++) {
                                let answerToMerge = allAnswers[answersInGroup[k]];
                                groupedAnswer.answerIds.push(answerToMerge.answerId);
                                groupedAnswer.teamIds.push(answerToMerge.teamId);
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
    }

    AnswersEqual(answer1, answer2) {
        if (answer1 == null || answer2 == null) {
            if (answer1 == null && answer2 == null) {
                return true;
            }
            return false;
        }

        if (answer1.unlockedClues.length !== answer2.unlockedClues.length) {
            return false;
        }

        let clueArray1 = answer1.unlockedClues.slice();
        clueArray1.sort(this.compareClues);
        let clueArray2 = answer2.unlockedClues.slice();
        clueArray2.sort(this.compareClues);
        for (var i = 0; i < clueArray1.length; i++) {
            if (!this.CluesEqual(clueArray1[i], clueArray2[i])) {
                return false;
            }
        }

        if (answer1.unlockedAchievements.length !== answer2.unlockedAchievements.length) {
            return false;
        }

        let achArray1 = answer1.unlockedAchievements.slice();
        achArray1.sort(this.compareAchievements);
        let achArray2 = answer2.unlockedAchievements.slice();
        achArray2.sort(this.compareAchievements);
        for (var j = 0; j < achArray1.length; j++) {
            if (!this.AchievementsEqual(achArray1[j], achArray2[j])) {
                return false;
            }
        }

        if (answer1.additionalContent === undefined || answer2.additionalContent === undefined) {
            if (!(answer1.additionalContent === undefined && answer2.additionalContent === undefined)) {
                return false;
            }
        } else if (!this.ContentEqual(answer1.additionalContent, answer2.additionalContent)) {
            return false;
        }

        if (answer1.answerResponse !== answer2.answerResponse) {
            return false;
        }
        if (answer1.answerText !== answer2.answerText) {
            return false;
        }
        if (answer1.isCorrectAnswer !== answer2.isCorrectAnswer) {
            return false;
        }

        return true;
    }

    ContentEqual(content1, content2) {
        if (content1 == null || content2 == null) {
            if (content1 == null && content2 == null) {
                return true;
            }
            return false;
        }

        if (content1.address !== content2.address) {
            return false;
        }
        if (content1.contentId !== content2.contentId) {
            return false;
        }
        if (content1.contentType !== content2.contentType) {
            return false;
        }
        if (content1.latitude !== content2.latitude) {
            return false;
        }
        if (content1.locationFlags !== content2.locationFlags) {
            return false;
        }
        if (content1.longitude !== content2.longitude) {
            return false;
        }
        if (content1.name !== content2.name) {
            return false;
        }
        if (content1.stringContent !== content2.stringContent) {
            return false;
        }

        return true;
    }

    AchievementsEqual(ach1, ach2) {
        if (ach1 == null || ach2 == null) {
            if (ach1 == null && ach2 == null) {
                return true;
            }
            return false;
        }

        if (ach1.achievementId !== ach2.achievementId) {
            return false;
        }
        if (ach1.description !== ach2.description) {
            return false;
        }
        if (ach1.lastUpdated !== ach2.lastUpdated) {
            return false;
        }
        if (ach1.name !== ach2.name) {
            return false;
        }

        return true;
    }

    compareAchievements(achA, achB) {
        const compareResult = achA.achievementId.localeCompare(achB.achievementId);
        if (compareResult !== 0) {
            return compareResult;
        }

        return 0;
    }

    CluesEqual(clue1, clue2) {
        if (clue1 == null || clue2 == null) {
            if (clue1 == null && clue2 == null) {
                return true;
            }
            return false;
        }

        if (clue1.lastUpdate !== clue2.lastUpdate) {
            return false;
        }
        if (clue1.shortTitle !== clue2.shortTitle) {
            return false;
        }
        if (clue1.sortOrder !== clue2.sortOrder) {
            return false;
        }
        if (clue1.submittableId !== clue2.submittableId) {
            return false;
        }
        if (clue1.submittableType !== clue2.submittableType) {
            return false;
        }
        if (clue1.tableOfContentId !== clue2.tableOfContentId) {
            return false;
        }
        if (clue1.title !== clue2.title) {
            return false;
        }

        return true;
    }

    compareClues(clueA, clueB) {
        if (clueA.sortOrder < clueB.sortOrder) {
            return -1;
        }

        if (clueA.sortOrder > clueB.sortOrder) {
            return 1;
        }

        const submittableIdCompare = clueA.submittableId.localeCompare(clueB.submittableId);
        if (submittableIdCompare !== 0) {
            return submittableIdCompare;
        }

        return 0;
    }

    compareAnswers(ansA, ansB) {
        const compareTextResult = ansA.answerText.localeCompare(ansB.answerText);
        if (compareTextResult !== 0) {
            return compareTextResult;
        }

        if (ansA.team !== undefined && ansB.team !== undefined) {
            const compareTeamNameResult = ansA.team.name.localeCompare(ansB.team);
            if (compareTeamNameResult !== 0) {
                return compareTeamNameResult;
            }
        }

        const compareIdResult = ansA.answerId.localeCompare(ansB.answerId);
        if (compareIdResult !== 0) {
            return compareIdResult;
        }

        return 0;
    }
}

const mapStateToProps = (state) => ({
    clues: getCluesModule(state),
    teams: getStaffTeams(state),
    achievements: getAchievementsModule(state),
});

const mapDispatchToProps = (dispatch) => ({
    getStaffAchievements: () => dispatch(fetchStaffAchievements()),
    addAnswerToClue: (tableOfContentId, answerTemplate) => dispatch(addAnswerToClue(tableOfContentId, answerTemplate)),
    deleteClueAnswer: (tableOfContentId, answerId) => dispatch(deleteClueAnswer(tableOfContentId, answerId)),
    addAchievementUnlockToAnswer: (answerId, achievementId) => dispatch(addAchievementUnlockToAnswer(answerId, achievementId)),
    deleteAchievementUnlockFromAnswer: (answerId, achievementId) => dispatch(deleteAchievementUnlockFromAnswer(answerId, achievementId)),
    addContentToAnswer: (tableOfContentId, answerId, contentTemplate) => dispatch(addContentToAnswer(tableOfContentId, answerId, contentTemplate)),
    deleteContentFromAnswer: (tableOfContentId, answerId) => dispatch(deleteContentFromAnswer(tableOfContentId, answerId)),
    addPuzzleUnlock: (answerId, tableOfContentId, teamId) => dispatch(addPuzzleUnlock(answerId, tableOfContentId, teamId)),
    deletePuzzleUnlock: (answerId, tableOfContentId) => dispatch(deletePuzzleUnlock(answerId, tableOfContentId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PuzzleAnswersList);
