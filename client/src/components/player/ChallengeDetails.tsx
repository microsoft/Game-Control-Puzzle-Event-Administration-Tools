import { Alert, ListGroup, ListGroupItem, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import moment from 'moment';
import 'moment-timezone';

import { putPlayerChallenge } from 'modules/player/challenges/service';
import { getChallengePluralNameSetting, getChallengeSingularNameSetting } from 'modules';

import ChallengeSubmissionFragment from './fragments/ChallengeSubmissionFragment';

import * as constants from '../../constants';
import { usePlayerChallenges, usePlayerTakeOverClue } from 'modules/player';

const getSubmissionStyle = (state: number) => {
    if (state === 1) {
        return 'success';
    } else if (state === 2) {
        return 'danger';
    } else {
        return undefined;
    }
};

const SubmissionContent = ({ submission }: { submission: any }) => {
    let submissionTextOrImage = <div>No content associated with this submission</div>;

    if (submission.submissionType === 'ChallengePic') {
        submissionTextOrImage = <img alt="Submission pic" src={`${constants.APPLICATION_URL}api/content/challengePic/${submission.challengeSubmissionId}`} />;
    } else if (submission.submissionType === 'BlobPic') {
        submissionTextOrImage = <img alt="Submission pic" src={`${submission.submissionTextContent}`} />;
    } else {
        submissionTextOrImage = <div>{submission.submissionTextContent}</div>;
    }

    return (
        <>
            {submissionTextOrImage}
            <div>
                <small>
                    <em>{submission.submissionNotes}</em>
                </small>
            </div>
            <div>
                <small>Submitted: {moment.utc(submission.submissionDate).fromNow()}</small>
            </div>
        </>
    );
};

const SubmissionForm = ({ currentChallenge }: { currentChallenge: any }) => {
    const challengesSingularName = useSelector(getChallengeSingularNameSetting);
    const dispatch = useDispatch();

    const pendingSubmission = currentChallenge.submissions.find((x: any) => x.state === 0);
    const approvedSubmission = currentChallenge.submissions.find((x: any) => x.state === 1);

    if (pendingSubmission !== undefined) {
        return (
            <>
                <h5>Pending Submission</h5>
                <Card>
                    <SubmissionContent submission={pendingSubmission} />
                </Card>
            </>
        );
    } else if (approvedSubmission !== undefined) {
        return (
            <Alert variant="success">
                <div>
                    <strong>You successfully completed the {challengesSingularName}!</strong>
                </div>
                {!!approvedSubmission.approverText ? (
                    <div>
                        <em>Game Control Notes: {approvedSubmission.approverText}</em>
                    </div>
                ) : (
                    ''
                )}
            </Alert>
        );
    } else if (!!currentChallenge.endTime && moment.utc().diff(moment.utc(currentChallenge.endTime)) > 0) {
        return (
            <Alert variant="danger">
                This {challengesSingularName} expired at {moment.utc(currentChallenge.endTime).local().format('MM-DD HH:mm')}.
            </Alert>
        );
    } else {
        return (
            <>
                <div>&nbsp;</div>''
                <Card className="playerChallengeForm">
                    <Card.Header>Submit {challengesSingularName} Entry</Card.Header>
                    <Card.Body>
                        <ChallengeSubmissionFragment onSubmit={(challenge: any) => dispatch(putPlayerChallenge(currentChallenge.challengeId, challenge))} />
                    </Card.Body>
                </Card>
            </>
        );
    }
};

const PreviousSubmissions = ({ challenge }: { challenge: any }) => {
    const previousSubmissions = challenge.submissions.filter((x: any) => x.state > 0);

    if (!!previousSubmissions && previousSubmissions.length > 0) {
        return (
            <div>
                <h5>Previous Submissions</h5>
                <ListGroup>
                    {previousSubmissions.map((submission: any) => (
                        <ListGroupItem key={submission.challengeSubmissionId} variant={getSubmissionStyle(submission.state)}>
                            <SubmissionContent submission={submission} />
                            <div>State: {submission.state === 1 ? 'Approved' : 'Rejected'}</div>
                            <div>Game Control Notes: {!!submission.approverText ? submission.approverText : 'No notes submitted'}</div>
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </div>
        );
    } else {
        return null;
    }
};

export const ChallengeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { challengesModule } = usePlayerChallenges();
    const takeOverClue = usePlayerTakeOverClue();
    const challengesSingularName = useSelector(getChallengeSingularNameSetting);
    const challengesPluralName = useSelector(getChallengePluralNameSetting);

    const currentChallenge = challengesModule.data.find((x: any) => id === x.challengeId);

    if (takeOverClue) {
        return <Redirect to={`/player/clue/${takeOverClue.tableOfContentId}`} />
    } else if (currentChallenge) {
        document.title = `${challengesPluralName} - ${currentChallenge.title}`;

        return (
            <div>
                <h2>{currentChallenge.title}</h2>
                <h4>{currentChallenge.description}</h4>
                {!!currentChallenge.endTime ? (
                    moment.utc().diff(moment.utc(currentChallenge.endTime)) > 0 ? (
                        ''
                    ) : (
                        <div>
                            <small>
                                This {challengesSingularName} is available until {moment.utc(currentChallenge.endTime).local().format('MM-DD HH:mm')}
                            </small>
                        </div>
                    )
                ) : (
                    ''
                )}
                <hr />
                <SubmissionForm currentChallenge={currentChallenge} />
                <hr />
                <PreviousSubmissions challenge={currentChallenge} />
            </div>
        );
    } else {
        document.title = `${challengesPluralName} - Details`;
        return <div>Could not find {challengesSingularName}</div>;
    }
};
