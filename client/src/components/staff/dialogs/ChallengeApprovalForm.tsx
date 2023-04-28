import React, { useState } from 'react';
import { Button,  Form,  FormGroup } from 'react-bootstrap';
import { ChallengeSubmission, ChallengeApproval, ChallengeApproved, ChallengeRejected } from 'modules/staff/challenges';

type Props = Readonly<{
    submission: ChallengeSubmission,
    onSubmit: (approval: ChallengeApproval) => void;
}>;

export const ChallengeApprovalForm = ({ submission, onSubmit }: Props) => {
    const [approverText, setApproverText] = useState('');

    return (
        <>
            <FormGroup>
                <Form.Label>GC Notes (team will see these):</Form.Label>
                <Form.Control type="text"
                                value={approverText}
                                onChange={event => setApproverText(event.target.value)}/>
            </FormGroup>
            <div>
                <Button onClick={() => onSubmit({
                    challengeSubmissionId: submission.challengeSubmissionId,
                    approverText,
                    state: ChallengeApproved
                })}>
                    Approve
                </Button>
                <Button onClick={() => onSubmit({
                    challengeSubmissionId: submission.challengeSubmissionId,
                    approverText,
                    state: ChallengeRejected
                })}>
                    Reject
                </Button>
            </div>
        </>
    );
}