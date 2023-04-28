import React, { useState } from 'react';
import { Button, Form, FormGroup } from 'react-bootstrap';

type Props = Readonly<{
    onSubmit: (pointsValue: number, reason: string) => void
}>;

export const GrantPointsForm = ({ onSubmit }: Props) => {
    const [pointsValue, setPointsValue] = useState(0);
    const [reason, setReason] = useState('');

    return (
        <>
            <FormGroup>
                <Form.Label>Points Value</Form.Label>
                <Form.Control type="text"
                              required
                              value={pointsValue}
                              onChange={event => {
                                  const numberValue: number = Number(event.target.value);
                                  if (!isNaN(numberValue)) {
                                      setPointsValue(numberValue);
                                  }
                              }}
                />
                <Form.Control.Feedback type="invalid">Value must be an integer number</Form.Control.Feedback>
            </FormGroup>
            <FormGroup>
                <Form.Label>Reason</Form.Label>
                <Form.Control type="text"
                              value={reason}
                              onChange={event => setReason(event.target.value)}
                />
            </FormGroup>            
            <div>
                <Button onClick={() => onSubmit(pointsValue, reason)}>
                    Grant
                </Button>
            </div>
        </>
    );
};