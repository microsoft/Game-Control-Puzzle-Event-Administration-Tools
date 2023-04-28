import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';

type Submission = Readonly<{
    answer: string;
}>;

type Props = Readonly<{
    hintText: string;
    disabled: boolean;
    doOnSubmit: (submission: Submission) => void;
}>;

export const SubmitAnswer = ({ disabled, doOnSubmit, hintText }: Props) => {
    const [answerText, setAnswerText] = useState('');

    const handleSubmitAnswer = (event: any) => {
        event.preventDefault(); 
        doOnSubmit({ answer: answerText });
        setAnswerText('');
    };

    return (
        <div>
            <form onSubmit={handleSubmitAnswer}>
                <Card className="playerSubmitAnswer">                
                    <Card.Header>{hintText}</Card.Header>
                    <Card.Body className="d-flex">
                        <Form.Control type="text" 
                            name="submissionText"
                            value={answerText}
                            disabled={disabled}
                            className="flex-grow-1"
                            onChange={(event: any) => setAnswerText(event.target.value)}/>
                        <Button type="submit" value="Submit" disabled={disabled}>Submit</Button>
                    </Card.Body>
                </Card>
            </form>            
        </div>
    );
};
