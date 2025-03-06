import React, { useState } from 'react';
import { Form, FormGroup, Button } from 'react-bootstrap';

import { Answer, AnswerTemplate } from 'modules/staff/clues';
import { StaffTeam } from 'modules/staff/teams/models';

type Props = Readonly<{
    answer?: AnswerTemplate;
    teams: StaffTeam[];
    onSubmit: (answerTemplate: AnswerTemplate) => void;
}>;

export const AnswerForm = ({ answer, teams, onSubmit }: Props) => {
    const [answerId] = useState(answer?.answerId);
    const [answerText, setAnswerText] = useState(answer?.answerText ?? '');
    const [answerResponse, setAnswerResponse] = useState(answer?.answerResponse ?? '');
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(answer?.isCorrectAnswer ?? false);
    const [isHidden, setIsHidden] = useState(answer?.isHidden ?? false);
    const [isTeamSpecific, setIsTeamSpecific] = useState(!!answer?.teamId);
    const [selectedTeams, setSelectedTeams] = useState(answer?.teamId ? [answer.teamId] : []);

    const isValidAnswerText = () => answerText.length !== 0;
    const isHiddenValid = () => !isHidden || isCorrectAnswer;
    const isValidTeamSelection = () => !isTeamSpecific || (isTeamSpecific && selectedTeams.length > 0);
    const isValid = () => isValidAnswerText() && isValidTeamSelection() && isHiddenValid();

    const mapHtmlCollection = (collection: any, propertyName: string) => {
        let result = [];
        for (var i = 0; i < collection.length; i++) {
            result.push(collection[i][propertyName]);
        }
        return result;
    };

    let sortedTeams = [];
    for (var i = 0; i < teams.length; i++) {
        sortedTeams.push(teams[i]);
    }

    sortedTeams.sort((team1, team2) => {
        return team1.name.localeCompare(team2.name);
    });

    return (
        <>
            <FormGroup>
                <Form.Label>Answer</Form.Label>
                <Form.Control type="text" value={answerText} disabled={!!answerId} isInvalid={!isValidAnswerText()} onChange={(event) => setAnswerText(event.target.value)} />
                <Form.Control.Feedback type="invalid">Answer text cannot be empty</Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
                <Form.Label>Response</Form.Label>
                <Form.Control type="text" value={answerResponse} onChange={(event) => setAnswerResponse(event.target.value)} />
            </FormGroup>
            <Form.Check type="checkbox" label="Is Correct Answer?" checked={isCorrectAnswer} onChange={(event: any) => setIsCorrectAnswer(event.target.checked)} />
            <Form.Check type="checkbox" label="Is Hidden Answer?" isInvalid={!isHiddenValid()} checked={isHidden} onChange={(event: any) => setIsHidden(event.target.checked)} />
            <Form.Control.Feedback>A hidden answer will show up as solved for teams, but will not show the answer text.</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Only correct answers can be hidden.</Form.Control.Feedback>
            <FormGroup>
                <Form.Label>
                    <Form.Check
                        type="checkbox"
                        label="Is Team Specific?"
                        checked={isTeamSpecific}
                        disabled={!!answerId}
                        onChange={(event: any) => setIsTeamSpecific(event.target.checked)}
                    />
                </Form.Label>
                <Form.Control
                    as="select"
                    disabled={!isTeamSpecific || !!answerId}
                    multiple={!answerId}
                    isInvalid={!isValidTeamSelection()}
                    onChange={(event: any) => setSelectedTeams(mapHtmlCollection(event.target.selectedOptions, 'value'))}
                >
                    {sortedTeams.map((team) => (
                        <option key={team.teamId} value={team.teamId}>
                            {team.name}
                        </option>
                    ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">At least one team must be selected if an answer is team specific.</Form.Control.Feedback>
            </FormGroup>
            <Button
                variant="outline-dark"
                onClick={() => {
                    if (isTeamSpecific && selectedTeams.length > 0) {
                        selectedTeams.forEach((selectedTeam) => {
                            onSubmit({
                                answerId,
                                answerText,
                                answerResponse,
                                isCorrectAnswer,
                                isHidden,
                                isTeamSpecific,
                                teamId: selectedTeam,
                            });
                        });
                    } else {
                        onSubmit({
                            answerId,
                            answerText,
                            answerResponse,
                            isCorrectAnswer,
                            isHidden,
                            isTeamSpecific: false,
                        });
                    }
                }}
                disabled={!isValid()}
            >
                Add
            </Button>
        </>
    );
};
