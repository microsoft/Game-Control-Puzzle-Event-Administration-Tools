import { Alert, Breadcrumb, Button, ListGroup, ListGroupItem, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import 'moment-timezone';

import { AdditionalContent } from '../staff/presentation/AdditionalContent';
import { AchievementItem } from '../shared/AchievementItem';
import { SubmitAnswer } from '../shared/SubmitAnswer';
import RatePuzzle from '../shared/RatePuzzle';
import { CallManager } from './CallManager';

import { getDerivedTeamId, getDerivedPlayerId } from 'modules';
import { Achievement, Content, PlayerSubmission, SolvedPlot, UnlockedClue, UnsolvedPlot } from 'modules/types';
import { PlayerClue, RatingTemplate, SubmissionTemplate, usePlayerClues } from 'modules/player';

type ContentListProps = Readonly<{
    content: Content[];
    teamId: string;
    playerId: string;
}>;

const ContentList = ({ content, teamId, playerId }: ContentListProps) => {
    if (content?.length > 0) {
        return (
            <Card className="contentCard">
                <Card.Body>
                    <ListGroup>
                        {content
                            .sort((a, b) => moment.utc(b.lastUpdated).diff(moment.utc(a.lastUpdated)))
                            .map((content) => (
                                <ListGroupItem key={content.contentId}>
                                    <AdditionalContent content={content} teamId={teamId} playerId={playerId} />
                                </ListGroupItem>
                            ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        );
    }

    return null;
};

const SubmissionHistory = ({ submissions, teamId, playerId }: { submissions: PlayerSubmission[]; teamId: string; playerId: string }) => {
    if (submissions.length > 0) {
        return (
            <Card>
                <Card.Header>Submission History</Card.Header>
                <Card.Body>
                    <ListGroup>
                        {submissions.map((submission) => (
                            <Submission key={submission.submissionId} submission={submission} playerId={playerId} teamId={teamId} />
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>
        );
    }

    return null;
};

const Submission = ({ submission, teamId, playerId }: { submission: PlayerSubmission; teamId: string; playerId: string }) => {
    let listGroupItemType: 'success' | 'warning' | 'danger';

    if (submission.isCorrectAnswer) {
        listGroupItemType = 'success';
    } else if (submission.answerResponse !== '' && submission.answerResponse !== null) {
        listGroupItemType = 'warning';
    } else {
        listGroupItemType = 'danger';
    }

    return (
        <ListGroupItem key={submission.submissionId} variant={listGroupItemType}>
            {submission.isHidden ? <h5>You successfully solved this puzzle</h5> : <h5>{submission.submission}</h5>}
            <div>
                <small>{submission.answerResponse}</small>
            </div>
            <div>
                <small>{moment.utc(submission.submissionTime).fromNow()}</small>
            </div>
            <UnlockedClues clues={submission.unlockedClues} />
            <UnlockedAchievements achievements={submission.unlockedAchievements} />
            {!!submission.additionalContent && (
                <div>
                    <AdditionalContent teamId={teamId} playerId={playerId} content={submission.additionalContent} />
                </div>
            )}
        </ListGroupItem>
    );
};

const UnlockedClues = ({ clues }: { clues?: UnlockedClue[] }) => {
    if (clues && clues.length > 0) {
        return (
            <div>
                <div>
                    <small>
                        <em>Unlocked Puzzles</em>
                    </small>
                </div>
                <ListGroup className="clickable">
                    {clues.map((unlock) => (
                        <ListGroupItem key={unlock.tableOfContentId}>
                            <LinkContainer to={`/player/clue/${unlock.tableOfContentId}`}>
                                <Button variant="link">{unlock.title}</Button>
                            </LinkContainer>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </div>
        );
    }

    return null;
};

const UnlockedAchievements = ({ achievements }: { achievements: Achievement[] }) => {
    if (achievements?.length > 0) {
        return (
            <div>
                <div>
                    <small>
                        <em>Unlocked Achievements</em>
                    </small>
                </div>
                <ListGroup>
                    {achievements.map((achievement) => {
                        return (
                            <ListGroupItem key={achievement.achievementId}>
                                <AchievementItem achievement={achievement} dateText="Unlocked" />
                            </ListGroupItem>
                        );
                    })}
                </ListGroup>
            </div>
        );
    } else {
        return null;
    }
};

type ClueHeaderProps = Readonly<{
    clue: PlayerClue;
    playerId: string;
    teamId: string;
    firstCorrectSubmission?: PlayerSubmission;
    isSubmittingAnswer: boolean;
    isSubmittingRating: boolean;
    submitAnswer: (tableOfContentId: string, submission: SubmissionTemplate) => void;
    rateClue: (tableOfContentId: string, rating: RatingTemplate) => void;
}>;

const ClueHeader = ({ clue, playerId, teamId, firstCorrectSubmission, isSubmittingAnswer, isSubmittingRating, submitAnswer, rateClue }: ClueHeaderProps) => {
    const handleSubmission = (submission: SubmissionTemplate) => submitAnswer(clue.tableOfContentId, submission);
    const handleRating = (playerRating: RatingTemplate) => rateClue(clue.tableOfContentId, playerRating);

    if (firstCorrectSubmission) {
        return (
            <div>
                <Alert variant="success">
                    {firstCorrectSubmission.isHidden ? <h4>You successfully solved this puzzle</h4> : <h4>{firstCorrectSubmission.submission}</h4>}
                    <p>{firstCorrectSubmission.answerResponse}</p>
                    <UnlockedClues clues={firstCorrectSubmission.unlockedClues} />
                    <UnlockedAchievements achievements={firstCorrectSubmission.unlockedAchievements} />
                    {!!firstCorrectSubmission.additionalContent && (
                        <div>
                            <AdditionalContent teamId={teamId} playerId={playerId} content={firstCorrectSubmission.additionalContent} />
                        </div>
                    )}
                </Alert>
                {!clue.isRated && <RatePuzzle isBusy={isSubmittingRating} onSubmit={handleRating} />}
            </div>
        );
    } else if (clue.submittableType.trim() !== 'Plot') {
        return (
            <Card>
                <SubmitAnswer
                    hintText={clue.submittableType.trim() === 'Puzzle' ? 'Submit an answer' : 'Submit an arrival code'}
                    disabled={isSubmittingAnswer}
                    doOnSubmit={handleSubmission}
                />
            </Card>
        );
    } else {
        return null;
    }
};

export const PlayerClueDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { cluesModule, submitAnswer, rateClue } = usePlayerClues();
    const currentClue = cluesModule.data.find((clue) => clue.tableOfContentId === id);
    const teamId = useSelector((state: any) => getDerivedTeamId(state, id));
    const playerId = useSelector((state: any) => getDerivedPlayerId(state, id));

    document.title = currentClue?.submittableTitle ?? 'Loading...';

    const firstCorrectSubmission = currentClue?.submissions.find((submission) => submission.isCorrectAnswer);
    const unsolvedPlot = currentClue?.content.filter((content) => content.name === UnsolvedPlot) ?? [];
    const solvedPlot = currentClue?.content.filter((content) => content.name === SolvedPlot) ?? [];
    const additionalContent = currentClue?.content.filter((content) => content.name !== SolvedPlot && content.name !== UnsolvedPlot) ?? [];

    const ClueContent = () => {
        if (currentClue) {
            return (
                <div>
                    {!!cluesModule.lastAnswerError && <Alert variant="danger">Failed to submit answer: {cluesModule.lastAnswerError.message}</Alert>}
                    <h3>{currentClue.submittableTitle}</h3>
                    <ClueHeader
                        teamId={teamId}
                        playerId={playerId}
                        clue={currentClue}
                        firstCorrectSubmission={firstCorrectSubmission}
                        isSubmittingAnswer={cluesModule.isSubmittingAnswer}
                        isSubmittingRating={cluesModule.isSubmittingRating}
                        submitAnswer={submitAnswer}
                        rateClue={rateClue}
                    />
                    <ContentList teamId={teamId} playerId={playerId} content={firstCorrectSubmission ? solvedPlot : unsolvedPlot} />
                    <ContentList teamId={teamId} playerId={playerId} content={additionalContent} />
                    <div>
                        <SubmissionHistory submissions={currentClue.submissions} playerId={playerId} teamId={teamId} />
                    </div>
                </div>
            );
        } else if (cluesModule.isLoading) {
            return <div>Loading clue details...</div>;
        } else {
            return <div>Failed to load clue</div>;
        }
    };

    return (
        <div>
            <Breadcrumb>
                <LinkContainer to="/player/home">
                    <Breadcrumb.Item>Puzzles</Breadcrumb.Item>
                </LinkContainer>
                <Breadcrumb.Item active>{currentClue?.submittableTitle ?? 'Unknown'}</Breadcrumb.Item>
            </Breadcrumb>
            <CallManager />
            {!!cluesModule.lastError && <Alert variant="danger">An error occured. Please contact Game Control. Error Message: {cluesModule.lastError.message}</Alert>}
            <ClueContent />
        </div>
    );
};
