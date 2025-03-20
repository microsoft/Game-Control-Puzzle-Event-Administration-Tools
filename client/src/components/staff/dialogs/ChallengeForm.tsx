import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import Datetime from 'react-datetime';
import moment from 'moment';

import { Challenge, ChallengeTemplate } from 'modules/staff/challenges';

type Props = Readonly<{
    pointsName: string;
    sourceChallenge?: Challenge;
    onSubmit: (challenge: ChallengeTemplate) => void;
    onComplete: () => void;
}>;

export const ChallengeForm = ({ pointsName, sourceChallenge, onSubmit, onComplete }: Props) => {
    const [challengeId] = useState(sourceChallenge?.challengeId ?? undefined);
    const [title, setTitle] = useState(sourceChallenge?.title ?? '');
    const [description, setDescription] = useState(sourceChallenge?.description ?? '');
    const [pointsAwarded, setPointsAwarded] = useState(sourceChallenge?.pointsAwarded?.toString() ?? '0');
    const [startTime, setStartTime] = useState(sourceChallenge?.startTime ?? null);
    const [endTime, setEndTime] = useState(sourceChallenge?.endTime ?? null);

    const isValid = () => !isNaN(parseInt(pointsAwarded)) && title.length > 0;

    return (
        <>
            <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" isInvalid={title.length === 0} value={title} onChange={(event) => setTitle(event.target.value)} />
                <Form.Control.Feedback type="invalid">Title must be provided</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control type="text" value={description} onChange={(event) => setDescription(event.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>{pointsName} Awarded for Completion</Form.Label>
                <Form.Control type="text" isInvalid={isNaN(parseInt(pointsAwarded))} value={pointsAwarded} onChange={(event) => setPointsAwarded(event.target.value)} />
                <Form.Control.Feedback type="invalid">Value must be an integer number</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Datetime value={startTime ? moment.utc(startTime).local() : undefined} onChange={(value) => moment.isMoment(value) && setStartTime(moment.utc(value))} />
            </Form.Group>
            <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Datetime value={endTime ? moment.utc(endTime).local() : undefined} onChange={(value) => moment.isMoment(value) && setEndTime(moment.utc(value))} />
            </Form.Group>
            <Button
                disabled={!isValid()}
                onClick={() => {
                    onSubmit({
                        challengeId,
                        title,
                        description,
                        pointsAwarded: parseInt(pointsAwarded),
                        startTime: startTime ?? undefined,
                        endTime: endTime ?? undefined,
                    });
                    onComplete();
                }}
            >
                {sourceChallenge ? 'Update' : 'Add'}
            </Button>
        </>
    );
};
