import React from 'react';
import { ListGroup, ListGroupItem, Card, CardColumns } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import 'moment-timezone';

import * as constants from '../../constants';
import { useStaffChallengeDetails, ChallengeSubmission, Challenge, ChallengeApproval } from 'modules/staff/challenges';
import { ChallengeApprovalForm, ChallengeForm } from './dialogs';
import DialogRenderProp from './dialogs/DialogRenderProp';
import { getChallengeSingularNameSetting, getPointsNameSetting } from 'modules';

const getColorForState = (state: number) => {
    if (state === 1) {
        return 'lightgreen';
    } else if (state === 2) {
        return 'lightred';
    } else {
        return undefined;
    }
};

const SubmissionContent = ({ submission }: { submission: ChallengeSubmission }) => {
    let submissionContent = <div>No submission content available</div>;

    if (submission.submissionType === 'ChallengePic') {
        submissionContent = <Card.Img variant="bottom" src={`${constants.APPLICATION_URL}api/content/challengePicFull/${submission.challengeSubmissionId}`} />;
    } else if (submission.submissionType === 'BlobPic') {
        submissionContent = <Card.Img variant="bottom" src={`${submission.submissionTextContent}`} />;
    } else {
        submissionContent = <div>{submission.submissionTextContent}</div>;
    }

    return (
        <Card>
            <Card.Header style={{ backgroundColor: getColorForState(submission.state) }}>
                {' '}
                Submitted by {submission.submitterDisplayName}: {moment.utc(submission.submissionDate).fromNow()}
            </Card.Header>
            <Card.Body>
                <Card.Title>
                    <div>{submission.submissionNotes}</div>
                </Card.Title>

                <div>
                    {!!submission.approverNotes && (
                        <div>
                            <b>
                                <em>
                                    <small>Review Notes: {submission.approverNotes}</small>
                                </em>
                            </b>
                        </div>
                    )}
                </div>

                {submissionContent}
            </Card.Body>
        </Card>
    );
};

const PendingSubmissions = ({ challenge, updateApproval }: { challenge: Challenge; updateApproval: (approval: ChallengeApproval) => void }) => {
    const pendingSubmissions = challenge.submissions.filter((x) => x.state === 0);

    if (pendingSubmissions?.length > 0) {
        return (
            <ListGroup>
                {pendingSubmissions.map((submission) => (
                    <ListGroupItem key={submission.challengeSubmissionId}>
                        <Card>
                            <SubmissionContent submission={submission} />
                            <ChallengeApprovalForm submission={submission} onSubmit={(approval: ChallengeApproval) => updateApproval(approval)} />
                        </Card>
                    </ListGroupItem>
                ))}
            </ListGroup>
        );
    } else {
        return <div>There are no pending submissions for this challenge.</div>;
    }
};

const PreviousSubmissions = ({ challenge }: { challenge: Challenge }) => {
    const previousSubmissions = challenge?.submissions.filter((x) => x.state > 0);

    if (previousSubmissions?.length > 0) {
        return (
            <CardColumns>
                {previousSubmissions.map((submission) => (
                    <SubmissionContent key={submission.challengeSubmissionId} submission={submission} />
                ))}
            </CardColumns>
        );
    } else {
        return <div>There no teams have made a submission for this challenge.</div>;
    }
};

export const StaffChallengeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { challenge, updateApproval, updateChallenge } = useStaffChallengeDetails(id);
    const challengeSingularName = useSelector(getChallengeSingularNameSetting);
    const pointsNameSetting = useSelector(getPointsNameSetting);

    if (challenge) {
        return (
            <div>
                <h4>
                    {challenge.title}
                    &nbsp;
                    <DialogRenderProp
                        renderTitle={() => `Edit ${challengeSingularName}`}
                        renderButton={() => <FaEdit />}
                        renderBody={(onComplete: any) => (
                            <ChallengeForm pointsName={pointsNameSetting} sourceChallenge={challenge} onSubmit={updateChallenge} onComplete={onComplete} />
                        )}
                    />
                </h4>
                <strong>{challenge.description}</strong>
                {!!challenge.startTime ? (
                    <div>
                        <small>
                            This {challengeSingularName} will be visible at: {moment.utc(challenge.startTime).local().format('MM-DD HH:mm')}
                        </small>
                    </div>
                ) : (
                    ''
                )}
                {!!challenge.endTime ? (
                    <div>
                        <small>
                            This {challengeSingularName} will expire at: {moment.utc(challenge.endTime).local().format('MM-DD HH:mm')}
                        </small>
                    </div>
                ) : (
                    ''
                )}
                <div>
                    <h5>Pending Submissions</h5>
                    <PendingSubmissions challenge={challenge} updateApproval={updateApproval} />
                </div>
                <div>
                    <h5>Previous Submissions</h5>
                    <PreviousSubmissions challenge={challenge} />
                </div>
            </div>
        );
    } else {
        return <div>Could not find challenge with id {id}</div>;
    }
};
