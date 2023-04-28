import React, { useState } from 'react';
import { Button, Form,  FormGroup } from 'react-bootstrap';
import { Participant } from 'modules/admin/models';
import { EditParticipantTemplate } from 'modules/admin/users/models';

type Props = Readonly<{
    user?: Participant;
    onSubmit: (participant: EditParticipantTemplate) => void;
    onComplete: () => void;
}>;

export const EditParticipantForm = ({ user, onSubmit, onComplete }: Props) => {
    const [email, setEmail] = useState(user?.email ?? '');
    const [contactNumber, setContactNumber] = useState(user?.contactNumber ?? '');
    const [firstName] = useState(user?.firstName ?? '');
    const [lastName] = useState(user?.lastName ?? '');
    //    const [login, setLogin] = useState(user?.login ?? '');

    return (
        <>
            <FormGroup>
                <Form.Label>Email Address</Form.Label>
                <Form.Control type="text"
                            value={email}
                            placeholder="User Email Address"
                            onChange={event => setEmail(event.target.value)}
                />
            </FormGroup>
            <FormGroup>
                <Form.Label>Contact Number</Form.Label>
                <Form.Control type="text"
                            value={contactNumber}
                            placeholder="Contact Phone Number"
                            onChange={event => setContactNumber(event.target.value)}
                />
            </FormGroup>
            { /*
            <FormGroup>
                <Form.Label>Game Control Login</Form.Label>
                <Form.Control type="text"
                            value={login}
                            disabled={true}
                            placeholder="Game Control Login"
                            onChange={event => setLogin(event.target.value)}
                />
            </FormGroup>
            */ }
            <Button onClick={() => 
                {
                    onSubmit({ email, contactNumber, firstName, lastName });
                    onComplete();
                }}>
                Update
            </Button>
        </>
    );
}